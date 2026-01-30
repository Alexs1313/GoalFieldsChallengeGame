import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

type GoalfieldsNeonButtonProps = {
  title: string;
  locked?: boolean;
};

const Goalfieldsneanbtn: React.FC<GoalfieldsNeonButtonProps> = ({
  title,
  locked = false,
}) => {
  return (
    <ImageBackground
      source={require('../../assets/images/goalfieneonbtn.png')}
      style={styles.neonOuter}
      resizeMode="stretch"
    >
      <View>
        <Text style={styles.neonTitle}>{title}</Text>

        {locked && (
          <>
            <View style={styles.lockLeft}>
              <Image
                source={require('../../assets/images/solar_lock-outline.png')}
              />
            </View>
            <View style={styles.lockRight}>
              <Image
                source={require('../../assets/images/solar_lock-outline.png')}
              />
            </View>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
});

export default Goalfieldsneanbtn;
