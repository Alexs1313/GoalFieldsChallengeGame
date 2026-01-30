import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ImageSourcePropType,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useStore } from '../goalfieldsstrg/context';
import GoalfieldsRulesModal from '../goalfieldscmpnts/Goalfieldsrulesmodal';
import GoalfieldsSetupModal from '../goalfieldscmpnts/Goalfieldssetupmodal';
import GoalfieldsSmallNeonButton from '../goalfieldscmpnts/Goalfieldssmallneanbtn';
import Goalfieldsneanbtn from '../goalfieldscmpnts/Goalfieldsneanbtn';

type RootStackParamList = {
  Home: undefined;
  FieldsGoalGame: { level: number };
};

const SETTINGS_KEY = 'GOALFIELD_SETTINGS_V1';
const PROGRESS_KEY = 'GOALFIELD_PROGRESS_V1';

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

  const [rulesVisible, setRulesVisible] = useState<boolean>(false);
  const [setupVisible, setSetupVisible] = useState<boolean>(false);

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

  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [hapticsOn, setHapticsOn] = useState<boolean>(true);
  const [notifOn, setNotifOn] = useState<boolean>(true);

  const { height } = useWindowDimensions();
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);

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
      const parsed = musicValue ? JSON.parse(musicValue) : null;
      if (typeof parsed === 'boolean') setIsEnabledSound(parsed);
    } catch {}
  };

  const loadVibration = async () => {
    try {
      const vibrValue = await AsyncStorage.getItem('toggleVibration');
      const parsed = vibrValue ? JSON.parse(vibrValue) : null;
      if (typeof parsed === 'boolean') setIsEnabledVibration(parsed);
    } catch {}
  };

  const loadNotifications = async () => {
    try {
      const notifValue = await AsyncStorage.getItem('toggleNotifications');
      const parsed = notifValue ? JSON.parse(notifValue) : null;
      if (typeof parsed === 'boolean') setIsEnabledNotifications(parsed);
    } catch {}
  };

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
    } catch {}
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
    } catch {}
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

  useEffect(() => {}, []);

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

            setSoundOn(!!s.soundOn);
            setHapticsOn(!!s.hapticsOn);
            setNotifOn(!!s.notifOn);
          }
        } catch {}

        try {
          const rawP = await AsyncStorage.getItem(PROGRESS_KEY);
          const p: any = rawP ? JSON.parse(rawP) : null;

          const u = Number(p?.unlockedLevel);
          setUnlockedLevel(
            Number.isFinite(u) ? Math.max(1, Math.min(4, u)) : 1,
          );
        } catch {
          setUnlockedLevel(1);
        }
      })();
    }, []),
  );

  useEffect(() => {
    AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ soundOn, hapticsOn, notifOn }),
    ).catch(() => {});
  }, [soundOn, hapticsOn, notifOn]);

  const handleLevelPress = (levelId: number) => {
    if (levelId > unlockedLevel) return;
    navigation.navigate('FieldsGoalGame', { level: levelId });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Goal Fields — can you beat all levels without spikes? ⚽️🔥',
      });
    } catch {}
  };

  const lockFor = (levelId: number) => levelId > unlockedLevel;

  const characterImg =
    CHARACTER_BY_LEVEL[Math.min(4, Math.max(1, unlockedLevel))];

  return (
    <ImageBackground
      source={require('../../assets/images/goalfiemainbg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.center, { paddingTop: height * 0.16, height: 800 }]}
        >
          <View style={styles.levelsStack}>
            {LEVELS.map(l => {
              const locked = lockFor(l.id);
              return (
                <TouchableOpacity
                  key={l.id}
                  activeOpacity={0.85}
                  onPress={() => handleLevelPress(l.id)}
                  disabled={locked}
                  style={styles.levelBtnWrap}
                >
                  <Goalfieldsneanbtn title={l.title} locked={locked} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSetupVisible(true)}
              style={{ flex: 1, marginRight: 12 }}
            >
              <GoalfieldsSmallNeonButton title="Setup" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setRulesVisible(true)}
              style={{ flex: 1, marginLeft: 12 }}
            >
              <GoalfieldsSmallNeonButton title="Rules" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.characterWrap} pointerEvents="none">
          <Image
            source={characterImg}
            style={styles.character}
            resizeMode="contain"
          />
        </View>

        <GoalfieldsRulesModal
          rulesVisible={rulesVisible}
          setRulesVisible={setRulesVisible}
        />

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
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Image source={require('../../assets/images/famicons_close.png')} />
          </Pressable>
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
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Image source={require('../../assets/images/famicons_close.png')} />
          </Pressable>
        </View>
        {children}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },

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
});

export default Home;
