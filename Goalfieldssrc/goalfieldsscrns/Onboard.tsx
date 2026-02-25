// Onboarding screen

import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground as Layout,
  ScrollView as BaseScrll,
  StyleSheet as CusStls,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Goalfieldspressablebtn from '../goalfieldscmpnts/Goalfieldspressablebtn';
import Orientation from 'react-native-orientation-locker';

type RootStackParamList = {
  Home: undefined;
};

const ongoalimages = [
  require('../../assets/images/goalfieon1.png'),
  require('../../assets/images/goalfieon2.png'),
  require('../../assets/images/goalfieon3.png'),
  require('../../assets/images/goalfieldldlogo.png'),
  require('../../assets/images/goalfieon4.png'),
] as const;

const ongoaltexts = [
  {
    upptxt: 'Guide the Ball',
    secdtxt:
      'Move the ball across grass tiles by tapping the next platform. Your goal is to reach the gate at the bottom.',
  },
  {
    upptxt: 'Hidden Traps',
    secdtxt:
      'Some tiles contain spikes. Before each move, you see how many spikes are in the current row, but not where they are.',
  },
  {
    upptxt: 'Use Your Safe Move',
    secdtxt:
      'You get one Safe Move per attempt. It gives one guaranteed safe step, then becomes unavailable.',
  },
  {
    upptxt: 'Beat Levels Smarter',
    secdtxt:
      'Each row always has at least one safe tile. Reach the goal to unlock levels and review attempts and safe guess percentage.',
  },
  {
    upptxt: 'Reach the Final Challenge',
    secdtxt:
      'Complete all four levels, unlock trophies for your character, and become the champion of Goal Fields.',
  },
] as const;

const Onboard: React.FC = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [currTrackMarker, setCurTrackMarker] = useState<number>(0);
  const [typedTitle, setTypedTitle] = useState<string>('');
  const [typedBody, setTypedBody] = useState<string>('');
  const [imgOpacity] = useState<Animated.Value>(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      Orientation.lockToPortrait();
    }, []),
  );

  const handleNext = () => {
    currTrackMarker < ongoaltexts.length - 1
      ? setCurTrackMarker(p => p + 1)
      : navigation.navigate('Home');
  };

  useEffect(() => {
    imgOpacity.setValue(0);
    Animated.timing(imgOpacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [currTrackMarker, imgOpacity]);

  useEffect(() => {
    const title = ongoaltexts[currTrackMarker].upptxt;
    const body = ongoaltexts[currTrackMarker].secdtxt;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    setTypedTitle('');
    setTypedBody('');

    for (let i = 0; i < title.length; i++) {
      timers.push(
        setTimeout(() => {
          setTypedTitle(title.slice(0, i + 1));
        }, i * 28),
      );
    }

    const bodyStartDelay = title.length * 28 + 120;
    for (let i = 0; i < body.length; i++) {
      timers.push(
        setTimeout(() => {
          setTypedBody(body.slice(0, i + 1));
        }, bodyStartDelay + i * 12),
      );
    }

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [currTrackMarker]);

  return (
    <Layout
      source={require('../../assets/images/goalfiemainbg.png')}
      style={{ flex: 1 }}
    >
      <BaseScrll
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.goalcont, { paddingBottom: height * 0.05 }]}>
          <Animated.View style={{ opacity: imgOpacity }}>
            <Image source={ongoalimages[currTrackMarker]} />
          </Animated.View>

          <Layout
            source={require('../../assets/images/goalfiemainboard.png')}
            style={{
              width: 340,
              height: 200,
              marginTop: 20,
            }}
            resizeMode="contain"
          >
            <View style={styles.boardContainer}>
              <Text style={styles.boardTitle}>
                {typedTitle}
              </Text>
              <Text style={styles.boardText}>
                {typedBody}
              </Text>
            </View>
          </Layout>

          <Goalfieldspressablebtn onPress={handleNext}>
            <Layout
              source={require('../../assets/images/goalfieldrndbtn.png')}
              style={styles.goalnextbtn}
            >
              <Image source={require('../../assets/images/goalfienxt.png')} />
            </Layout>
          </Goalfieldspressablebtn>
        </View>
      </BaseScrll>
    </Layout>
  );
};

const styles = CusStls.create({
  goalcont: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  boardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  boardTitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  boardText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  goalnextbtn: {
    width: 53,
    height: 53,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});

export default Onboard;
