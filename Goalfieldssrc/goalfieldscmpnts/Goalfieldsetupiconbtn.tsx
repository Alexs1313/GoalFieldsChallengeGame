// Icon button component

import {
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Goalfieldspressablebtn from './Goalfieldspressablebtn';
import React from 'react';

type GoalfieldSetupIconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const Goalfieldsetupiconbtn: React.FC<GoalfieldSetupIconButtonProps> = ({
  icon,
  onPress,
  style,
}) => {
  const { height } = useWindowDimensions();
  const isSmallScreen = height <= 700;

  return (
    <Goalfieldspressablebtn onPress={onPress} style={style}>
      <ImageBackground
        source={require('../../assets/images/goalfieldrndbtn.png')}
        style={[
          styles.iconBtnOuter,
          {
            width: isSmallScreen ? 48 : 54,
            height: isSmallScreen ? 48 : 54,
          },
        ]}
      >
        {icon}
      </ImageBackground>
    </Goalfieldspressablebtn>
  );
};

const styles = StyleSheet.create({
  iconBtnOuter: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Goalfieldsetupiconbtn;
