// Neon button component

import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import React from 'react';

type GoalfieldsNeonButtonProps = {
  title: string;
  locked?: boolean;
};

const Goalfieldsneanbtn: React.FC<GoalfieldsNeonButtonProps> = ({
  title,
  locked = false,
}) => {
  const { height } = useWindowDimensions();
  const isSmallScreen = height <= 700;

  const neonOuterWidth = isSmallScreen ? 170 : 192;
  const neonOuterHeight = isSmallScreen ? 50 : 70;
  const titleFontSize = isSmallScreen ? 15 : 17;
  const lockOffset = isSmallScreen ? 10 : 14;

  return (
    <ImageBackground
      source={require('../../assets/images/goalfieneonbtn.png')}
      style={[
        styles.neonOuter,
        { width: neonOuterWidth, height: neonOuterHeight },
      ]}
      resizeMode="stretch"
    >
      <View>
        <Text style={[styles.neonTitle, { fontSize: titleFontSize }]}>
          {title}
        </Text>

        {locked && (
          <>
            <View style={[styles.lockLeft, { left: lockOffset }]}>
              <Image
                source={require('../../assets/images/solar_lock-outline.png')}
              />
            </View>
            <View style={[styles.lockRight, { right: lockOffset }]}>
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
