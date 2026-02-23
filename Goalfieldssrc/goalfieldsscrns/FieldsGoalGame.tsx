// Game screen

// react imports
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Orientation from 'react-native-orientation-locker';

// my local cmpnts
import { useStore } from '../goalfieldsstrg/context';
import { LEVEL_META } from '../goalfieldsdt/goalLevels';
import Goalfieldspressablebtn from '../goalfieldscmpnts/Goalfieldspressablebtn';

const PROGRESS_KEY = 'GOALFIELD_PROGRESS_V1';

type RootStackParamList = {
  Home: undefined;
  FieldsGoalGame: { level: number };
};

type GameRoute = RouteProp<RootStackParamList, 'FieldsGoalGame'>;

type SpikeGrid = boolean[][];

// random int function

const randInt = (a: number, b: number): number =>
  Math.floor(Math.random() * (b - a + 1)) + a;

// shuffle function
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// generate level foo
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
  const [attemptsCount, setAttemptsCount] = useState<number>(1);
  const [totalGuesses, setTotalGuesses] = useState<number>(0);
  const [safeGuesses, setSafeGuesses] = useState<number>(0);
  const [shakingTile, setShakingTile] = useState<SelectedTile>(null);
  const [canSkipRow, setCanSkipRow] = useState<boolean>(true);

  // load settings
  const {
    isEnabledVibration,
    isEnabledSound,
    isEnabledNotifications,
    winClick,
    loseClick,
  } = useStore();

  // anim refs -------

  const ballX = useRef<Animated.Value>(new Animated.Value(0)).current;
  const ballY = useRef<Animated.Value>(new Animated.Value(0)).current;
  const ballScale = useRef<Animated.Value>(new Animated.Value(1)).current;
  const tileShakeX = useRef<Animated.Value>(new Animated.Value(0)).current;
  const tileShakeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const popScale = useRef<Animated.Value>(new Animated.Value(0)).current;
  const popOpacity = useRef<Animated.Value>(new Animated.Value(0)).current;
  const introAppear = useRef<Animated.Value>(new Animated.Value(0)).current;
  const deadAppear = useRef<Animated.Value>(new Animated.Value(0)).current;
  const winAppear = useRef<Animated.Value>(new Animated.Value(0)).current;

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // stop tile shaked
  const stopTileShake = () => {
    tileShakeAnimRef.current?.stop();
    tileShakeAnimRef.current = null;
    tileShakeX.setValue(0);
    setShakingTile(null);
  };

  // start tile shake
  const startTileShake = (r: number, c: number) => {
    stopTileShake();
    setShakingTile({ r, c });

    const oneShake = Animated.sequence([
      Animated.timing(tileShakeX, {
        toValue: -3,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(tileShakeX, {
        toValue: 3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(tileShakeX, {
        toValue: -3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(tileShakeX, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]);

    const anim = Animated.loop(oneShake);
    tileShakeAnimRef.current = anim;
    anim.start();

    const stopTimer = setTimeout(() => {
      stopTileShake();
    }, 500);
    timersRef.current.push(stopTimer);
  };

  // clear timouts
  useEffect(
    () => () => {
      clearTimers();
      stopTileShake();
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      Orientation.lockToPortrait();
    }, []),
  );

  // intro  animation -------

  useEffect(() => {
    if (!introVisible) return;

    introAppear.setValue(0);

    Animated.timing(introAppear, {
      toValue: 1,
      duration: 260,

      easing: Easing.out(Easing.cubic),

      useNativeDriver: true,
    }).start();
  }, [introVisible, introAppear]);

  // lose animation -------

  useEffect(() => {
    if (!deadVisible) return;

    deadAppear.setValue(0);

    Animated.timing(deadAppear, {
      toValue: 1,

      duration: 260, // duration 260ms

      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [deadVisible, deadAppear]);

  useEffect(() => {
    if (!winVisible) return;

    winAppear.setValue(0);

    Animated.timing(winAppear, {
      toValue: 1, // to value 1

      duration: 260, // duration 260ms

      easing: Easing.out(Easing.cubic), //  cubic

      useNativeDriver: true,
    }).start();
  }, [winVisible, winAppear]);

  const rowsCols = meta.rows; // rows cols

  const rowsCount = rowsCols.length; // rows count

  const maxCols = Math.max(...rowsCols); // max cols

  const topReserve = Math.round(height * 0.28); // top reserve

  const bottomReserve = Math.round(height * 0.22); // bottom reserve

  const availableW = width * 0.92; // available width

  // available height
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

    // loop through rows
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

  const ballSize = Math.round(tileSize * 0.66); // ball size 66% of tile size

  const setBallToStart = () => {
    const firstRow = rowsLayout[0];

    if (!firstRow?.length) return;

    const left = firstRow[0].x;

    const right = firstRow[firstRow.length - 1].x + tileSize;

    const centerX = (left + right) / 2;

    ballX.setValue(centerX - ballSize / 2);

    ballY.setValue(startY - tileSize * 0.9);
    // ball scale 1
    ballScale.setValue(1);
  };

  useEffect(() => {
    setBallToStart();
  }, [rowsLayout, tileSize, ballSize, startY]);

  const playSound = (name: 'goal' | 'pop') => {
    if (!isEnabledSound) return;

    if (name === 'goal') winClick(); // win click
    if (name === 'pop') loseClick(); // lose click
  };

  const doHaptic = () => {
    if (!isEnabledVibration) return;
    Vibration.vibrate(60); // vibrate 60ms
  };

  const resetLevel = (opts?: { resetStats?: boolean }) => {
    setWinVisible(false);

    setDeadVisible(false);

    setIsWaiting(false);
    // show intro modal false
    setIntroVisible(false);

    setActiveRow(0);
    setSelected(null);

    setShowAllSpikes(false);
    stopTileShake();
    setCanSkipRow(true);

    setShowPopGif(false);
    setBallAlive(true);

    // reset stats if resetStats is true
    if (opts?.resetStats) {
      setAttemptsCount(1);
      setTotalGuesses(0);
      setSafeGuesses(0);
    }

    const next = generateLevel(meta.rows, meta.spikesRange);

    setSpikes(next);

    setTimeout(setBallToStart, 0);
  };

  // ball animation to target x and y
  const animateBallTo = (x: number, y: number, onDone?: () => void) => {
    // sequence animation
    Animated.sequence([
      Animated.timing(ballScale, {
        toValue: 1.08,
        duration: 120,

        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(ballX, {
          toValue: x,
          duration: 280, // duration 280ms

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

  // unlock next level fu
  const unlockNextLevel = async () => {
    try {
      const rawP = await AsyncStorage.getItem(PROGRESS_KEY);

      const current: any = rawP ? JSON.parse(rawP) : {};
      // get unlocked level from async storage
      const unlockedLevel = Math.max(
        1,
        Math.min(4, Number(current?.unlockedLevel || 1)),
      );

      // get next level
      const next = Math.min(4, Math.max(unlockedLevel, levelId + 1));
      // set unlocked level to async storage
      await AsyncStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ ...current, unlockedLevel: next }),
      );
    } catch {
      console.log('unlock next level error');
    }
  };

  // on tile press function
  const onTilePress = (rowIndex: number, colIndex: number) => {
    if (isWaiting) return; // if is waiting return

    if (winVisible || deadVisible) return; // if win or dead visible return

    if (introVisible) return; // if intro visible return

    if (rowIndex !== activeRow) {
      startTileShake(rowIndex, colIndex);
      return;
    }

    setSelected({ r: rowIndex, c: colIndex });

    setTotalGuesses(prev => prev + 1);

    const isSpike = !!spikes?.[rowIndex]?.[colIndex];

    const pos = rowsLayout[rowIndex][colIndex];

    const targetX = pos.x + tileSize / 2 - ballSize / 2;

    const targetY = pos.y + tileSize / 2 - ballSize / 2;

    // animate ball to target x and y
    animateBallTo(targetX, targetY, async () => {
      if (isSpike) {
        // if is spike return
        setAttemptsCount(prev => prev + 1); // increment attempts count
        startTileShake(rowIndex, colIndex);

        setShowAllSpikes(true); // show all spikes
        setIsWaiting(true);

        doHaptic(); // do haptic
        playSound('pop'); // play pop sound

        if (isEnabledNotifications) {
          // show toast notification
          Toast.show({
            type: 'info',
            text1: 'Ball popped! Try again.',
            position: 'top',
            visibilityTime: 4000,
          });
        }

        setShowPopGif(true);

        // show pop gif
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

      // set safe guesses
      setSafeGuesses(prev => prev + 1);
      const nextRow = rowIndex + 1;
      // if next row is greater than rows cols length return
      if (nextRow >= rowsCols.length) {
        playSound('goal'); // play goal sound

        await unlockNextLevel();

        setWinVisible(true);

        setIsWaiting(true);

        setShowWinConfetti(true);

        // show toast notification =>>
        if (isEnabledNotifications) {
          Toast.show({
            type: 'success',
            text1: 'Level Complete! Well done!',
            position: 'top',
            visibilityTime: 4000,
          });
        }

        // setTimeout to show win confetti
        const t1 = setTimeout(() => {
          setShowWinConfetti(false);

          setIsWaiting(false);
        }, 6000);

        timersRef.current.push(t1); // push timeout to timers ref
        return;
      }

      setActiveRow(nextRow);
    });
  };

  // go back menu function
  const goMenu = () => navigation.goBack();

  // on skip row press function
  const onSkipRowPress = () => {
    if (!canSkipRow) return; // if can skip row return
    if (isWaiting || winVisible || deadVisible || introVisible) return;

    if (activeRow >= rowsCols.length - 1) return; // if active row is greater than rows cols length return

    const row = rowsLayout[activeRow];

    if (!row?.length) return; // if row is null or undefined return

    setCanSkipRow(false); // set can skip row to false

    setIsWaiting(true); // set is waiting to true

    setSelected(null); // set selected to null

    const left = row[0].x;
    // get right x
    const right = row[row.length - 1].x + tileSize;
    // get center x
    const centerX = (left + right) / 2;
    // get target x
    const targetX = centerX - ballSize / 2;
    // get target y
    const targetY = row[0].y + tileSize / 2 - ballSize / 2;

    animateBallTo(targetX, targetY, () => {
      setActiveRow(prev => Math.min(prev + 1, rowsCols.length - 1));
      setIsWaiting(false);
    });

    // show toast notification =>>
    if (isEnabledNotifications) {
      Toast.show({
        type: 'success',
        text1: 'Safe move used', // safe move used
        position: 'top', // top position
        visibilityTime: 1800, // visibility time 1800ms
      });
    }
  };

  // safe guesses percent %age
  const safeGuessesPercent =
    totalGuesses > 0 ? Math.round((safeGuesses / totalGuesses) * 100) : 0;

  const activeRowSpikesCount = spikes?.[activeRow]?.filter(Boolean).length ?? 0;

  const rowHintText =
    activeRowSpikesCount === 0
      ? 'This row has no spikes.'
      : activeRowSpikesCount === 1
      ? 'This row has 1 spike.'
      : `This row has ${activeRowSpikesCount} spikes.`;

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

      {/* hint wrapper */}

      {!introVisible && !deadVisible && !winVisible && (
        <View style={styles.rowHintWrap}>
          <ImageBackground
            source={require('../../assets/images/goalfieneons.png')}
            style={styles.rowHintBtn}
            resizeMode="stretch"
          >
            <Text style={styles.rowHintText}>{rowHintText}</Text>
          </ImageBackground>
        </View>
      )}

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {rowsLayout.map((row, r) => (
          <View key={`row-${r}`}>
            {row.map((p, c) => {
              const spikeHere = !!spikes?.[r]?.[c];
              const isSelected = selected?.r === r && selected?.c === c;
              const isShaking = shakingTile?.r === r && shakingTile?.c === c;

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
                  <Animated.View
                    style={[
                      styles.tileInner,
                      isShaking
                        ? { transform: [{ translateX: tileShakeX }] }
                        : null,
                    ]}
                  >
                    <Image
                      source={tileImg}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  </Animated.View>
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
        <View style={styles.bottomMenuRow}>
          <Goalfieldspressablebtn
            onPress={onSkipRowPress}
            disabled={!canSkipRow}
          >
            <ImageBackground
              source={require('../../assets/images/goalfieneons.png')}
              style={[styles.bottomMenuBtn, !canSkipRow && styles.usedSkipBtn]}
              resizeMode="stretch"
            >
              <Text style={styles.bottomMenuText}>Safe Move</Text>
            </ImageBackground>
          </Goalfieldspressablebtn>

          <Goalfieldspressablebtn onPress={goMenu}>
            <ImageBackground
              source={require('../../assets/images/goalfieneons.png')}
              style={styles.bottomMenuBtn}
              resizeMode="stretch"
            >
              <Text style={styles.bottomMenuText}>Menu</Text>
            </ImageBackground>
          </Goalfieldspressablebtn>
        </View>
      </View>

      <Modal visible={introVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.modalCardAnimated,
              {
                opacity: introAppear,
                transform: [
                  {
                    scale: introAppear.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <ImageBackground
              source={require('../../assets/images/goalfierulesboard.png')}
              style={styles.introBoard}
              resizeMode="stretch"
            >
              <Text style={styles.introTitle}>{meta.name}</Text>
              <Text style={styles.introText}>{meta.subtitle}</Text>
              <Text style={styles.introText}>
                {spikesText(meta.spikesRange)}
              </Text>
            </ImageBackground>

            <View style={styles.introBtns}>
              <Goalfieldspressablebtn
                onPress={() => {
                  setIntroVisible(false);
                  resetLevel({ resetStats: true });
                }}
              >
                <ImageBackground
                  source={require('../../assets/images/goalfieneons.png')}
                  style={styles.introBtn}
                  resizeMode="stretch"
                >
                  <Text style={styles.introBtnText}>Start</Text>
                </ImageBackground>
              </Goalfieldspressablebtn>

              <Goalfieldspressablebtn onPress={goMenu}>
                <ImageBackground
                  source={require('../../assets/images/goalfieneons.png')}
                  style={styles.introBtn}
                  resizeMode="stretch"
                >
                  <Text style={styles.introBtnText}>Menu</Text>
                </ImageBackground>
              </Goalfieldspressablebtn>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={deadVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.modalCardAnimated,
              {
                opacity: deadAppear,
                transform: [
                  {
                    scale: deadAppear.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                ],
              },
            ]}
          >
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
              <Goalfieldspressablebtn onPress={() => resetLevel()}>
                <ImageBackground
                  source={require('../../assets/images/goalfieneons.png')}
                  style={styles.introBtn}
                  resizeMode="stretch"
                >
                  <Text style={styles.introBtnText}>Restart</Text>
                </ImageBackground>
              </Goalfieldspressablebtn>

              <Goalfieldspressablebtn onPress={goMenu}>
                <ImageBackground
                  source={require('../../assets/images/goalfieneons.png')}
                  style={styles.introBtn}
                  resizeMode="stretch"
                >
                  <Text style={styles.introBtnText}>Menu</Text>
                </ImageBackground>
              </Goalfieldspressablebtn>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={winVisible} transparent animationType="fade">
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

          <Animated.View
            style={[
              styles.modalCardAnimated,
              {
                opacity: winAppear,
                transform: [
                  {
                    scale: winAppear.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image source={require('../../assets/images/winimg.png')} />

            <ImageBackground
              source={require('../../assets/images/goalfierulesboard.png')}
              style={styles.resultBoard}
              resizeMode="stretch"
            >
              <Text style={styles.resultTitle}>Great job!</Text>
              <Text style={styles.resultText}>
                You scored the goal.{'\n'}A new level is now unlocked.{'\n\n'}
                Number of attempts: {attemptsCount}
                {'\n'}
                Safe guess percentage: {safeGuessesPercent}%
              </Text>
            </ImageBackground>

            <View style={styles.introBtns}>
              <Goalfieldspressablebtn
                onPress={() => resetLevel({ resetStats: true })}
              >
                <ImageBackground
                  source={require('../../assets/images/goalfieneons.png')}
                  style={styles.introBtn}
                  resizeMode="stretch"
                >
                  <Text style={styles.introBtnText}>Restart</Text>
                </ImageBackground>
              </Goalfieldspressablebtn>

              <Goalfieldspressablebtn onPress={goMenu}>
                <ImageBackground
                  source={require('../../assets/images/goalfieneons.png')}
                  style={styles.introBtn}
                  resizeMode="stretch"
                >
                  <Text style={styles.introBtnText}>Menu</Text>
                </ImageBackground>
              </Goalfieldspressablebtn>
            </View>
          </Animated.View>
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
    top: 40,
    alignSelf: 'center',
    zIndex: 20,
  },
  topBadge: {
    width: 192,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHintWrap: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    zIndex: 20,
  },
  rowHintBtn: {
    minWidth: 220,
    minHeight: 54,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHintText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    textAlign: 'center',
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
  tileInner: {
    width: '100%',
    height: '100%',
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
  bottomMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  bottomMenuBtn: {
    width: 148,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usedSkipBtn: {
    opacity: 0.6,
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
  modalCardAnimated: {
    alignItems: 'center',
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
    height: 235,
    paddingHorizontal: 26,
    paddingTop: 20,
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
