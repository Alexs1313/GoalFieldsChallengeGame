// Home screen

import {
  Animated as AnimBld,
  Easing,
  Image as Img,
  ImageBackground,
  Modal as PopWrapp,
  ScrollView,
  Share as forwApp,
  StyleSheet as BaseSSh,
  Text,
  useWindowDimensions as viewport,
  View,
  ImageSourcePropType,
  Linking,
} from 'react-native';

import React, { useCallback, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// my componets
import { useStore } from '../goalfieldsstrg/context';
import GoalfieldsRulesModal from '../goalfieldscmpnts/Goalfieldsrulesmodal';
import GoalfieldsSetupModal from '../goalfieldscmpnts/Goalfieldssetupmodal';
import GoalfieldsSmallNeonButton from '../goalfieldscmpnts/Goalfieldssmallneanbtn';
import Goalfieldsneanbtn from '../goalfieldscmpnts/Goalfieldsneanbtn';
import Goalfieldspressablebtn from '../goalfieldscmpnts/Goalfieldspressablebtn';

type RootStackParamList = {
  Home: undefined;
  FieldsGoalGame: { level: number };
};

// async storage keys

const SETTINGS_KEY = 'GOALFIELD_SETTINGS_V1';

const PROGRESS_KEY = 'GOALFIELD_PROGRESS_V1';

const DAILY_CHALLENGE_LAST_SHOWN_KEY = 'GOALFIELD_DAILY_CHALLENGE_LAST_SHOWN';

// charcters images
const CHARACTER_BY_LEVEL: Record<number, ImageSourcePropType> = {
  1: require('../../assets/images/homeman.png'),
  2: require('../../assets/images/homeman2.png'),
  3: require('../../assets/images/homeman3.png'),
  4: require('../../assets/images/homeman4.png'),
  5: require('../../assets/images/homeman5.png'),
};

type LevelItem = { id: number; title: string };

const LEVELS: LevelItem[] = [
  { id: 1, title: 'Starter\nField' },
  { id: 2, title: 'Midfield\nRoute' },
  { id: 3, title: 'Danger\nGrid' },
  { id: 4, title: 'Pyramid\nChallenge' },
];

type NeonModalProps = {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
};

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // modal states ------------------------------------------------
  const [rulesVisible, setRulesVisible] = useState<boolean>(false);
  const [setupVisible, setSetupVisible] = useState<boolean>(false);

  // context states ----------------------------------------------
  const {
    isEnabledVibration,
    setIsEnabledVibration,
    isEnabledSound,
    setIsEnabledSound,
    isEnabledNotifications,
    setIsEnabledNotifications,
  } = useStore() as {
    isEnabledVibration: boolean;
    setIsEnabledVibration: (v: boolean) => void;
    isEnabledSound: boolean;
    setIsEnabledSound: (v: boolean) => void;
    isEnabledNotifications: boolean;
    setIsEnabledNotifications: (v: boolean) => void;
  };

  // daily challenge states --------------------------------------
  const [dailyChallengeVisible, setDailyChallengeVisible] =
    useState<boolean>(false);
  const [dailyChallengeStats, setDailyChallengeStats] = useState<{
    streak: string;
    levelsCompleted: string;
    bestAccuracy: string;
    totalAttempts: string;
  }>({
    streak: '1',
    levelsCompleted: '0',
    bestAccuracy: '0%',
    totalAttempts: '0',
  });

  const { height } = viewport();
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const levelShakeX = useRef<Record<number, AnimBld.Value>>({
    1: new AnimBld.Value(0),
    2: new AnimBld.Value(0),
    3: new AnimBld.Value(0),
    4: new AnimBld.Value(0),
  }).current;

  // load settings

  useFocusEffect(
    useCallback(() => {
      loadMusic();
      loadVibration();
      loadNotifications();
    }, []),
  );

  const loadMusic = async () => {
    try {
      const musicValue = await AsyncStorage.getItem('toggleSound');
      const parsedjson = musicValue ? JSON.parse(musicValue) : null;
      if (typeof parsedjson === 'boolean') setIsEnabledSound(parsedjson);
    } catch {
      console.log('load music eror');
    }
  };

  const loadVibration = async () => {
    try {
      const vibrValue = await AsyncStorage.getItem('toggleVibration');
      const parsedjson = vibrValue ? JSON.parse(vibrValue) : null;
      if (typeof parsedjson === 'boolean') setIsEnabledVibration(parsedjson);
    } catch {
      console.log('load vibration err');
    }
  };

  const loadNotifications = async () => {
    try {
      const notifValue = await AsyncStorage.getItem('toggleNotifications');
      const parsedjson = notifValue ? JSON.parse(notifValue) : null;
      if (typeof parsedjson === 'boolean')
        setIsEnabledNotifications(parsedjson);
    } catch {
      console.log('loading ntf err');
    }
  };

  // handlers

  const toggleVibration = async (value: boolean) => {
    if (isEnabledNotifications) {
      Toast.show({
        type: 'success',
        text1: `Vibration ${value ? 'enabled' : 'disabled'}`,
        position: 'top',
        visibilityTime: 2000,
      });
    }
    try {
      await AsyncStorage.setItem('toggleVibration', JSON.stringify(value));
      setIsEnabledVibration(value);
    } catch {
      console.log('vibro errror');
    }
  };

  const toggleNotifications = async (value: boolean) => {
    Toast.show({
      type: 'success',
      text1: `Notifications ${value ? 'enabled' : 'disabled'}`,
      position: 'top',
      visibilityTime: 2000,
    });

    try {
      await AsyncStorage.setItem('toggleNotifications', JSON.stringify(value));
      setIsEnabledNotifications(value);
    } catch {
      console.log('notifications err');
    }
  };

  const toggleMusic = async (value: boolean) => {
    if (isEnabledNotifications) {
      Toast.show({
        type: 'success',
        text1: `Sound ${value ? 'enabled' : 'disabled'}`,
        position: 'top',
        visibilityTime: 2000,
      });
    }
    try {
      await AsyncStorage.setItem('toggleSound', JSON.stringify(value));
      setIsEnabledSound(value);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const rawS = await AsyncStorage.getItem(SETTINGS_KEY);

          if (rawS) {
            const s: Partial<{
              soundOn: boolean;

              hapticsOn: boolean;

              notifOn: boolean;
            }> = JSON.parse(rawS);
          }
        } catch {
          console.log('catcj error sett');
        }

        try {
          const rawP = await AsyncStorage.getItem(PROGRESS_KEY);
          const p: any = rawP ? JSON.parse(rawP) : null;

          const u = Number(p?.unlockedLevel);

          const safeUnlocked = Number.isFinite(u)
            ? Math.max(1, Math.min(4, u))
            : 1;
          setUnlockedLevel(safeUnlocked);

          const streak = Number(p?.dailyStreak);

          const bestAccuracy = Number(p?.bestAccuracy);

          const totalAttempts = Number(p?.totalAttempts);

          const levelsCompleted = Math.max(0, safeUnlocked - 1);

          setDailyChallengeStats({
            streak: Number.isFinite(streak) ? String(Math.max(1, streak)) : '1',

            levelsCompleted: String(levelsCompleted),

            bestAccuracy: Number.isFinite(bestAccuracy)
              ? `${Math.max(0, Math.min(100, Math.round(bestAccuracy)))}%`
              : '0%',
            totalAttempts: Number.isFinite(totalAttempts)
              ? String(Math.max(0, Math.round(totalAttempts)))
              : '0',
          });
        } catch {
          setUnlockedLevel(1);

          setDailyChallengeStats({
            streak: '1',
            levelsCompleted: '0',
            bestAccuracy: '0%',
            totalAttempts: '0',
          });
        }

        try {
          const today = new Date().toISOString().slice(0, 10);

          const lastShown = await AsyncStorage.getItem(
            DAILY_CHALLENGE_LAST_SHOWN_KEY,
          );

          if (lastShown !== today) {
            setDailyChallengeVisible(true);

            await AsyncStorage.setItem(DAILY_CHALLENGE_LAST_SHOWN_KEY, today);
          }
        } catch {
          setDailyChallengeVisible(true);
        }
      })();
    }, []),
  );

  const handleLevelPress = (levelId: number) => {
    if (levelId > unlockedLevel) {
      const curreentShakeBt = levelShakeX[levelId];

      curreentShakeBt.stopAnimation();

      curreentShakeBt.setValue(0);

      // sequence animation
      AnimBld.sequence([
        AnimBld.timing(curreentShakeBt, {
          toValue: -5,

          duration: 45,

          easing: Easing.linear,

          useNativeDriver: true,
        }),
        AnimBld.timing(curreentShakeBt, {
          toValue: 5,
          // duration :
          duration: 90,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        AnimBld.timing(curreentShakeBt, {
          toValue: -5,
          duration: 90,

          easing: Easing.linear,
          useNativeDriver: true,
        }),
        AnimBld.timing(curreentShakeBt, {
          toValue: 0,
          duration: 45,
          easing: Easing.linear,
          useNativeDriver: true,
        }),

        // start =>
      ]).start();
      return;
    }
    navigation.navigate('FieldsGoalGame', { level: levelId });
  };

  const handleShare = async () => {
    Linking.openURL(
      'https://apps.apple.com/us/app/piinc0-challenge-game-fields/id6759533003',
    );
  };

  const lockFor = (levelId: number) => levelId > unlockedLevel;

  // character image after unlock level
  const characterImg =
    CHARACTER_BY_LEVEL[Math.min(4, Math.max(1, unlockedLevel))];

  const streakNum = Number(dailyChallengeStats.streak);

  // streak days array
  const streakDayLabels =
    Number.isFinite(streakNum) && streakNum > 1
      ? Array.from({ length: 5 }, (_, i) => `Day ${streakNum + i}`)
      : ['Today', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

  return (
    <ImageBackground
      source={require('../../assets/images/goalfiemainbg.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Img
          source={require('../../assets/images/wave.png')}
          style={{
            position: 'absolute',
            top: 0,
          }}
        />
        <View
          style={[styles.center, { paddingTop: height * 0.16, height: 800 }]}
        >
          {/* level butons */}
          <View style={styles.levelsStack}>
            {LEVELS.map(l => {
              const locked = lockFor(l.id);
              return (
                <Goalfieldspressablebtn
                  key={l.id}
                  onPress={() => handleLevelPress(l.id)}
                  style={styles.levelBtnWrap}
                >
                  <AnimBld.View
                    style={{ transform: [{ translateX: levelShakeX[l.id] }] }}
                  >
                    <Goalfieldsneanbtn title={l.title} locked={locked} />
                  </AnimBld.View>
                </Goalfieldspressablebtn>
              );
            })}
          </View>

          {/* setup and rules bottom buttons */}
          <View style={styles.bottomRow}>
            <Goalfieldspressablebtn
              onPress={() => setSetupVisible(true)}
              style={{ flex: 1, marginRight: 12 }}
            >
              <GoalfieldsSmallNeonButton title="Setup" />
            </Goalfieldspressablebtn>

            <Goalfieldspressablebtn
              onPress={() => setRulesVisible(true)}
              style={{ flex: 1, marginLeft: 12 }}
            >
              <GoalfieldsSmallNeonButton title="Rules" />
            </Goalfieldspressablebtn>
          </View>
        </View>

        {/* character img */}
        <View style={styles.characterWrap} pointerEvents="none">
          <Img
            source={characterImg}
            style={styles.character}
            resizeMode="contain"
          />
        </View>

        {/* rules modal */}

        <GoalfieldsRulesModal
          rulesVisible={rulesVisible}
          setRulesVisible={setRulesVisible}
        />

        {/* setup modal */}

        <GoalfieldsSetupModal
          setupVisible={setupVisible}
          setSetupVisible={setSetupVisible}
          isEnabledSound={isEnabledSound}
          toggleMusic={toggleMusic}
          isEnabledNotifications={isEnabledNotifications}
          toggleNotifications={toggleNotifications}
          isEnabledVibration={isEnabledVibration}
          toggleVibration={toggleVibration}
          handleShare={handleShare}
        />

        {/* daily challenge modal */}
        <PopWrapp
          visible={dailyChallengeVisible}
          transparent
          animationType="fade"
        >
          <View style={styles.modalBackdrop}>
            <ImageBackground
              source={require('../../assets/images/goalfierulesboard.png')}
              style={styles.dailyBoard}
              resizeMode="stretch"
            >
              <Text style={styles.dailyTitle}>Daily Challenge</Text>
              <View style={styles.streakRow}>
                {streakDayLabels.map((label, idx) => (
                  <Text
                    key={label}
                    style={[
                      styles.streakDayText,
                      idx === 0 && styles.streakDayActive,
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>
              <Text style={[styles.dailyText, { marginTop: 10 }]}>
                Levels Completed: {dailyChallengeStats.levelsCompleted}
              </Text>
              <Text style={styles.dailyText}>
                Best Accuracy: {dailyChallengeStats.bestAccuracy}
              </Text>
              <Text style={styles.dailyText}>
                Total Attempts: {dailyChallengeStats.totalAttempts}
              </Text>
            </ImageBackground>

            <Goalfieldspressablebtn
              onPress={() => setDailyChallengeVisible(false)}
            >
              <ImageBackground
                source={require('../../assets/images/goalfieneons.png')}
                style={styles.dailyBtn}
                resizeMode="stretch"
              >
                <Text style={styles.dailyBtnText}>OK</Text>
              </ImageBackground>
            </Goalfieldspressablebtn>
          </View>
        </PopWrapp>
      </ScrollView>
    </ImageBackground>
  );
};

export const NeonModalTall: React.FC<NeonModalProps> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <ImageBackground
      source={require('../../assets/images/goalfierulesboard.png')}
      style={styles.tallModalOuter}
    >
      <View style={styles.modalInnerTall}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Goalfieldspressablebtn
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            pressScale={0.93}
            pressDownOffset={1}
          >
            <Img source={require('../../assets/images/famicons_close.png')} />
          </Goalfieldspressablebtn>
        </View>
        <View>{children}</View>
      </View>
    </ImageBackground>
  );
};

export const NeonModalSquare: React.FC<NeonModalProps> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <ImageBackground
      source={require('../../assets/images/setupmodal.png')}
      style={styles.smallModalOuter}
    >
      <View style={styles.modalInnerSquare}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Goalfieldspressablebtn
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            pressScale={0.93}
            pressDownOffset={1}
          >
            <Img source={require('../../assets/images/famicons_close.png')} />
          </Goalfieldspressablebtn>
        </View>
        {children}
      </View>
    </ImageBackground>
  );
};

const styles = BaseSSh.create({
  center: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },

  levelsStack: {
    width: 240,
    alignItems: 'center',
  },

  levelBtnWrap: {
    marginBottom: 16,
  },

  neonOuter: {
    height: 70,
    width: 192,
    justifyContent: 'center',
  },

  neonTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },

  smallModalOuter: {
    width: 307,
    height: 295,
    resizeMode: 'contain',
  },

  lockLeft: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  lockRight: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  bottomRow: {
    flexDirection: 'row',
    marginTop: 32,
    width: 270,
  },

  characterWrap: {
    alignSelf: 'center',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    bottom: -70,
    width: '100%',
  },

  character: {
    width: 320,
    height: 320,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  tallModalOuter: {
    width: 351,
    height: 591,
  },

  modalInnerTall: {
    paddingTop: 28,
    paddingBottom: 18,
    paddingHorizontal: 35,
  },

  modalInnerSquare: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },

  modalHeader: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Montserrat-SemiBold',
  },

  closeBtn: {
    position: 'absolute',
    right: 5,
    top: 5,
  },

  rulesText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    paddingHorizontal: 10,
    marginTop: 5,
  },

  setupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 8,
  },

  iconBtnOuter: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyBoard: {
    width: 330,
    minHeight: 280,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 24,
    alignItems: 'center',
  },
  dailyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 14,
  },
  dailyText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    width: '100%',
    marginBottom: 3,
  },
  streakRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 5,
  },
  streakDayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  streakDayActive: {
    color: '#00D62F',
  },
  dailyBtn: {
    width: 140,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  dailyBtnText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
  },
});

export default Home;
