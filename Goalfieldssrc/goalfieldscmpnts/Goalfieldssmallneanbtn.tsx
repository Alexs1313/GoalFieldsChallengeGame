// Small neon button component

import {
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import React from 'react';

type GoalfieldsSmallNeonButtonProps = {
  title: string;
};

const GoalfieldsSmallNeonButton: React.FC<GoalfieldsSmallNeonButtonProps> = ({
  title,
}) => {
  const { height } = useWindowDimensions();
  const isSmallScreen = height <= 700;

  return (
    <ImageBackground
      source={require('../../assets/images/goalfieneons.png')}
      style={[
        styles.smallOuter,
        {
          width: isSmallScreen ? 118 : 131,
          height: isSmallScreen ? 44 : 48,
        },
      ]}
    >
      <Text style={[styles.smallTitle, { fontSize: isSmallScreen ? 16 : 18 }]}>
        {title}
      </Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  smallOuter: {
    width: 131,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default GoalfieldsSmallNeonButton;
