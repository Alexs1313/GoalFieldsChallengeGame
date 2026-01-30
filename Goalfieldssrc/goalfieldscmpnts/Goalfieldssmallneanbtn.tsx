import React from 'react';
import { ImageBackground, StyleSheet, Text } from 'react-native';

type GoalfieldsSmallNeonButtonProps = {
  title: string;
};

const GoalfieldsSmallNeonButton: React.FC<GoalfieldsSmallNeonButtonProps> = ({
  title,
}) => {
  return (
    <ImageBackground
      source={require('../../assets/images/goalfieneons.png')}
      style={styles.smallOuter}
    >
      <Text style={styles.smallTitle}>{title}</Text>
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
