import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

type RootStackParamList = {
  Home: undefined;
};

const ongoalimages = [
  require('../../assets/images/goalfieon1.png'),
  require('../../assets/images/goalfieon2.png'),
  require('../../assets/images/goalfieon3.png'),
  require('../../assets/images/goalfieon4.png'),
] as const;

const ongoaltexts = [
  {
    title: 'Guide the Ball',
    text: 'Move the ball across grass tiles by tapping the next platform. Your goal is to reach the gate at the bottom.',
  },
  {
    title: 'Hidden Traps',
    text: 'Some tiles contain spikes. Step on them and the ball pops. Pass a row safely to reveal where the spikes were.',
  },
  {
    title: 'Every Row Has a Safe Tile',
    text: 'Each row is always passable. Memorize revealed spikes and choose the safest route to the goal.',
  },
  {
    title: 'Reach the Final Challenge',
    text: 'Complete all four levels, unlock trophies for your character, and become the champion of Goal Fields.',
  },
] as const;

const Onboard: React.FC = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleNext = () => {
    if (currentIndex < 3) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/goalfiemainbg.png')}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.goalcont, { paddingBottom: height * 0.05 }]}>
          <Image source={ongoalimages[currentIndex]} />

          <ImageBackground
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
                {ongoaltexts[currentIndex].title}
              </Text>
              <Text style={styles.boardText}>
                {ongoaltexts[currentIndex].text}
              </Text>
            </View>
          </ImageBackground>

          <TouchableOpacity activeOpacity={0.7} onPress={handleNext}>
            <ImageBackground
              source={require('../../assets/images/goalfieldrndbtn.png')}
              style={styles.goalnextbtn}
            >
              <Image source={require('../../assets/images/goalfienxt.png')} />
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  goalcont: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  boardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  boardTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  boardText: {
    fontSize: 16,
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
