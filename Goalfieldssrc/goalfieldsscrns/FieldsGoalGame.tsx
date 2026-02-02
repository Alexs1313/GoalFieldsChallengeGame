import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Vibration,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Orientation from 'react-native-orientation-locker';

import { useStore } from '../goalfieldsstrg/context';
import { LEVEL_META } from '../goalfieldsdt/goalLevels';

const PROGRESS_KEY = 'GOALFIELD_PROGRESS_V1';

type RootStackParamList = {
  Home: undefined;
  FieldsGoalGame: { level: number };
};

type GameRoute = RouteProp<RootStackParamList, 'FieldsGoalGame'>;

type SpikeGrid = boolean[][];

const randInt = (a: number, b: number): number =>
  Math.floor(Math.random() * (b - a + 1)) + a;

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function generateLevel(
  rowsCols: number[],
  spikesRange: [number, number],
): SpikeGrid {
  const maxSpikesPossible = rowsCols.reduce((s, n) => s + (n - 1), 0);
  const target = Math.min(
    maxSpikesPossible,
    Math.max(0, randInt(spikesRange[0], spikesRange[1])),
  );

  const spikes: SpikeGrid = rowsCols.map(cols => Array(cols).fill(false));
  const rowCaps = rowsCols.map(c => c - 1);
  let remaining = target;

  const order = shuffle(rowsCols.map((_, i) => i));
  for (const r of order) {
    if (remaining <= 0) break;
    const cap = rowCaps[r];
    const put = Math.min(cap, randInt(0, Math.min(cap, remaining)));

    const cols = rowsCols[r];
    const idxs = shuffle([...Array(cols).keys()]);
    let placed = 0;

    for (const idx of idxs) {
      if (placed >= put) break;
      spikes[r][idx] = true;
      placed++;
    }

    if (spikes[r].every(Boolean)) {
      const k = spikes[r].findIndex(Boolean);
      spikes[r][k] = false;
      placed--;
    }

    remaining -= placed;
  }

  if (remaining > 0) {
    const rowIdxs = shuffle(rowsCols.map((_, i) => i));
    for (const r of rowIdxs) {
      if (remaining <= 0) break;
      const cols = rowsCols[r];
      const current = spikes[r].filter(Boolean).length;
      const cap = cols - 1;
      if (current >= cap) continue;

      const canAdd = Math.min(cap - current, remaining);
      const safeIdxs = shuffle(
        [...Array(cols).keys()].filter(i => !spikes[r][i]),
      );

      let added = 0;
      for (const idx of safeIdxs) {
        if (added >= canAdd) break;
        spikes[r][idx] = true;
        added++;
      }

      if (spikes[r].every(Boolean)) spikes[r][safeIdxs[0]] = false;
      remaining -= added;
    }
  }

  for (let r = 0; r < spikes.length; r++) {
    if (spikes[r].every(Boolean)) {
      spikes[r][randInt(0, spikes[r].length - 1)] = false;
    }
  }

  return spikes;
}

type SelectedTile = { r: number; c: number } | null;

type LevelMeta = {
  name: string;
  subtitle: string;
  rows: number[];
  spikesRange: [number, number];
};

export default function FieldsGoalGame(): JSX.Element {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<GameRoute>();
  const { width, height } = useWindowDimensions();

  const levelId = Number(route?.params?.level ?? 1);
  const meta: LevelMeta =
    (LEVEL_META as Record<number, LevelMeta>)[levelId] ||
    (LEVEL_META as Record<number, LevelMeta>)[1];

  const [showWinConfetti, setShowWinConfetti] = useState<boolean>(false);

  const [showPopGif, setShowPopGif] = useState<boolean>(false);
  const [ballAlive, setBallAlive] = useState<boolean>(true);

  // state
  const [introVisible, setIntroVisible] = useState<boolean>(true);
  const [deadVisible, setDeadVisible] = useState<boolean>(false);
  const [winVisible, setWinVisible] = useState<boolean>(false);

  const [spikes, setSpikes] = useState<SpikeGrid>(() =>
    generateLevel(meta.rows, meta.spikesRange),
  );

  const [selected, setSelected] = useState<SelectedTile>(null);
  const [showAllSpikes, setShowAllSpikes] = useState<boolean>(false);
  const [activeRow, setActiveRow] = useState<number>(0);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  const {
    isEnabledVibration,
    isEnabledSound,
    isEnabledNotifications,
    winClick,
    loseClick,
  } = useStore();

  const ballX = useRef<Animated.Value>(new Animated.Value(0)).current;
  const ballY = useRef<Animated.Value>(new Animated.Value(0)).current;
  const ballScale = useRef<Animated.Value>(new Animated.Value(1)).current;

  const popScale = useRef<Animated.Value>(new Animated.Value(0)).current;
  const popOpacity = useRef<Animated.Value>(new Animated.Value(0)).current;

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  useFocusEffect(
    useCallback(() => {
      Orientation.lockToPortrait();
      return () => Orientation.unlockAllOrientations();
    }, []),
  );

  const rowsCols = meta.rows;
  const rowsCount = rowsCols.length;
  const maxCols = Math.max(...rowsCols);

  const topReserve = Math.round(height * 0.22);
  const bottomReserve = Math.round(height * 0.22);

  const availableW = width * 0.92;
  const availableH = height - topReserve - bottomReserve;

  const hGapRatio = 0.18;
  const vGapRatio = 0.32;

  const tileSizeByW = availableW / (maxCols + (maxCols - 1) * hGapRatio);
  const tileSizeByH = availableH / (rowsCount + (rowsCount - 1) * vGapRatio);

  const tileSize = Math.round(
    Math.max(44, Math.min(80, Math.min(tileSizeByW, tileSizeByH))),
  );

  const hGap = Math.round(tileSize * hGapRatio);
  const rowGap = Math.round(tileSize * vGapRatio);

  const startY = topReserve;

  type Pos = { x: number; y: number };
  const rowsLayout = useMemo<Pos[][]>(() => {
    const centerX = width / 2;
    const out: Pos[][] = [];

    for (let r = 0; r < rowsCols.length; r++) {
      const cols = rowsCols[r];
      const totalW = cols * tileSize + (cols - 1) * hGap;
      const left = centerX - totalW / 2;
      const y = startY + r * (tileSize + rowGap);

      const row: Pos[] = [];
      for (let c = 0; c < cols; c++) {
        const x = left + c * (tileSize + hGap);
        row.push({ x, y });
      }
      out.push(row);
    }
    return out;
  }, [rowsCols, tileSize, hGap, rowGap, startY, width]);

  const ballSize = Math.round(tileSize * 0.66);

  const setBallToStart = () => {
    const firstRow = rowsLayout[0];
    if (!firstRow?.length) return;

    const left = firstRow[0].x;
    const right = firstRow[firstRow.length - 1].x + tileSize;
    const centerX = (left + right) / 2;

    ballX.setValue(centerX - ballSize / 2);
    ballY.setValue(startY - tileSize * 0.9);
    ballScale.setValue(1);
  };

  useEffect(() => {
    setBallToStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsLayout, tileSize, ballSize, startY]);

  const playSound = (name: 'goal' | 'pop') => {
    if (!isEnabledSound) return;
    if (name === 'goal') winClick();
    if (name === 'pop') loseClick();
  };

  const doHaptic = () => {
    if (!isEnabledVibration) return;
    Vibration.vibrate(60);
  };

  const resetLevel = () => {
    setWinVisible(false);
    setDeadVisible(false);
    setIsWaiting(false);
    setIntroVisible(false);
    setActiveRow(0);
    setSelected(null);
    setShowAllSpikes(false);

    setShowPopGif(false);
    setBallAlive(true);

    const next = generateLevel(meta.rows, meta.spikesRange);
    setSpikes(next);

    setTimeout(setBallToStart, 0);
  };

  const animateBallTo = (x: number, y: number, onDone?: () => void) => {
    Animated.sequence([
      Animated.timing(ballScale, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(ballX, {
          toValue: x,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ballY, {
          toValue: y,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ballScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => onDone?.());
  };

  const unlockNextLevel = async () => {
    try {
      const rawP = await AsyncStorage.getItem(PROGRESS_KEY);
      const current: any = rawP ? JSON.parse(rawP) : {};
      const unlockedLevel = Math.max(
        1,
        Math.min(4, Number(current?.unlockedLevel || 1)),
      );
      const next = Math.min(4, Math.max(unlockedLevel, levelId + 1));
      await AsyncStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ ...current, unlockedLevel: next }),
      );
    } catch {}
  };

  const onTilePress = (rowIndex: number, colIndex: number) => {
    if (isWaiting) return;
    if (winVisible || deadVisible) return;
    if (introVisible) return;
    if (rowIndex !== activeRow) return;

    setSelected({ r: rowIndex, c: colIndex });

    const isSpike = !!spikes?.[rowIndex]?.[colIndex];
    const pos = rowsLayout[rowIndex][colIndex];

    const targetX = pos.x + tileSize / 2 - ballSize / 2;
    const targetY = pos.y + tileSize / 2 - ballSize / 2;

    animateBallTo(targetX, targetY, async () => {
      if (isSpike) {
        setShowAllSpikes(true);
        setIsWaiting(true);

        doHaptic();
        playSound('pop');

        if (isEnabledNotifications) {
          Toast.show({
            type: 'info',
            text1: 'Ball popped! Try again.',
            position: 'top',
            visibilityTime: 4000,
          });
        }

        setShowPopGif(true);

        setTimeout(() => {
          setShowPopGif(false);
          setBallAlive(false);
        }, 700);

        setTimeout(() => {
          setDeadVisible(true);
          setIsWaiting(false);
        }, 2000);

        return;
      }

      const nextRow = rowIndex + 1;
      if (nextRow >= rowsCols.length) {
        playSound('goal');
        await unlockNextLevel();

        setWinVisible(true);
        setIsWaiting(true);

        setShowWinConfetti(true);

        if (isEnabledNotifications) {
          Toast.show({
            type: 'success',
            text1: 'Level Complete! Well done!',
            position: 'top',
            visibilityTime: 4000,
          });
        }

        const t1 = setTimeout(() => {
          setShowWinConfetti(false);
          setIsWaiting(false);
        }, 6000);

        timersRef.current.push(t1);
        return;
      }

      setActiveRow(nextRow);
    });
  };

  const goMenu = () => navigation.goBack();

  return (
    <ImageBackground
      source={require('../../assets/images/goalgamebg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.topBadgeWrap}>
        <ImageBackground
          source={require('../../assets/images/goalfieneonbtn.png')}
          style={styles.topBadge}
          resizeMode="stretch"
        >
          <Text style={styles.topBadgeText}>{meta.name}</Text>
        </ImageBackground>
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {rowsLayout.map((row, r) => (
          <View key={`row-${r}`}>
            {row.map((p, c) => {
              const spikeHere = !!spikes?.[r]?.[c];
              const isSelected = selected?.r === r && selected?.c === c;

              const tileImg =
                showAllSpikes && spikeHere
                  ? require('../../assets/images/spike.png')
                  : isSelected
                  ? require('../../assets/images/openedgrass.png')
                  : require('../../assets/images/grass.png');

              return (
                <TouchableOpacity
                  key={`t-${r}-${c}`}
                  activeOpacity={0.85}
                  onPress={() => onTilePress(r, c)}
                  style={[
                    styles.tile,
                    { width: tileSize, height: tileSize, left: p.x, top: p.y },
                  ]}
                >
                  <Image
                    source={tileImg}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.ball,
          {
            width: ballSize,
            height: ballSize,
            transform: [
              { translateX: ballX },
              { translateY: ballY },
              { scale: ballScale },
            ],
          },
        ]}
        pointerEvents="none"
      >
        {showPopGif ? (
          <Image
            source={require('../../assets/images/ball_pop.gif')}
            style={{ width: 250, height: 130 }}
          />
        ) : ballAlive ? (
          <Image
            source={require('../../assets/images/goalball.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        ) : null}
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.pop,
          {
            opacity: popOpacity,
            transform: [
              { translateX: ballX },
              { translateY: ballY },
              { scale: popScale },
            ],
          },
        ]}
      />

      <View style={styles.bottomMenuWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={goMenu}>
          <ImageBackground
            source={require('../../assets/images/goalfieneons.png')}
            style={styles.bottomMenuBtn}
            resizeMode="stretch"
          >
            <Text style={styles.bottomMenuText}>Menu</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>

      <Modal
        visible={introVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.modalBackdrop}>
          <ImageBackground
            source={require('../../assets/images/goalfierulesboard.png')}
            style={styles.introBoard}
            resizeMode="stretch"
          >
            <Text style={styles.introTitle}>{meta.name}</Text>
            <Text style={styles.introText}>{meta.subtitle}</Text>
            <Text style={styles.introText}>{spikesText(meta.spikesRange)}</Text>
          </ImageBackground>

          <View style={styles.introBtns}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setIntroVisible(false);
                resetLevel();
              }}
            >
              <ImageBackground
                source={require('../../assets/images/goalfieneons.png')}
                style={styles.introBtn}
                resizeMode="stretch"
              >
                <Text style={styles.introBtnText}>Start</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={goMenu}>
              <ImageBackground
                source={require('../../assets/images/goalfieneons.png')}
                style={styles.introBtn}
                resizeMode="stretch"
              >
                <Text style={styles.introBtnText}>Menu</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deadVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.modalBackdrop}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Image
              source={require('../../assets/images/homeman.png')}
              style={{ width: 190, height: 190 }}
              resizeMode="contain"
            />
          </View>

          <ImageBackground
            source={require('../../assets/images/goalfierulesboard.png')}
            style={styles.resultBoard}
            resizeMode="stretch"
          >
            <Text style={styles.resultTitle}>Ball popped!</Text>
            <Text style={styles.resultText}>
              Try again and find the safe path.
            </Text>
          </ImageBackground>

          <View style={styles.introBtns}>
            <TouchableOpacity activeOpacity={0.9} onPress={resetLevel}>
              <ImageBackground
                source={require('../../assets/images/goalfieneons.png')}
                style={styles.introBtn}
                resizeMode="stretch"
              >
                <Text style={styles.introBtnText}>Restart</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={goMenu}>
              <ImageBackground
                source={require('../../assets/images/goalfieneons.png')}
                style={styles.introBtn}
                resizeMode="stretch"
              >
                <Text style={styles.introBtnText}>Menu</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={winVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <View style={styles.modalBackdrop}>
          {showWinConfetti && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { zIndex: 999, alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Image
                source={require('../../assets/images/winConfetti.gif')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          )}

          <Image source={require('../../assets/images/winimg.png')} />

          <ImageBackground
            source={require('../../assets/images/goalfierulesboard.png')}
            style={styles.resultBoard}
            resizeMode="stretch"
          >
            <Text style={styles.resultTitle}>Great job!</Text>
            <Text style={styles.resultText}>
              You scored the goal.{'\n'}A new level is now unlocked.
            </Text>
          </ImageBackground>

          <View style={styles.introBtns}>
            <TouchableOpacity activeOpacity={0.9} onPress={resetLevel}>
              <ImageBackground
                source={require('../../assets/images/goalfieneons.png')}
                style={styles.introBtn}
                resizeMode="stretch"
              >
                <Text style={styles.introBtnText}>Restart</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={goMenu}>
              <ImageBackground
                source={require('../../assets/images/goalfieneons.png')}
                style={styles.introBtn}
                resizeMode="stretch"
              >
                <Text style={styles.introBtnText}>Menu</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

function spikesText([a, b]: [number, number]): string {
  return a === b
    ? `Level contains ${a} spikes.`
    : `Level contains ${a}–${b} spikes.`;
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  topBadgeWrap: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
    zIndex: 20,
  },
  topBadge: {
    width: 192,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBadgeText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ball: {
    position: 'absolute',
    zIndex: 30,
    backgroundColor: 'transparent',
  },

  pop: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 120, 220, 0.30)',
    zIndex: 40,
  },

  bottomMenuWrap: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    zIndex: 20,
  },
  bottomMenuBtn: {
    width: 160,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomMenuText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  introBoard: {
    width: 330,
    height: 220,
    paddingHorizontal: 26,
    paddingTop: 24,
    alignItems: 'center',
  },
  introTitle: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  introText: {
    color: 'rgba(255,255,255,0.92)',
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 6,
    marginTop: 5,
  },

  introBtns: {
    flexDirection: 'row',
    marginTop: 18,
  },
  introBtn: {
    width: 140,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  introBtnText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
  },

  resultBoard: {
    width: 330,
    height: 190,
    paddingHorizontal: 26,
    paddingTop: 26,
    alignItems: 'center',
  },
  resultTitle: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 22,
    marginBottom: 14,
    textAlign: 'center',
  },
  resultText: {
    color: 'rgba(255,255,255,0.92)',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },

  confetti: {
    position: 'absolute',
    width: 10,
    height: 16,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
