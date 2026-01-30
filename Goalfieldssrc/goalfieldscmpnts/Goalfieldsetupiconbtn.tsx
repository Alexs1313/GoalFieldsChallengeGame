import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';

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
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      <ImageBackground
        source={require('../../assets/images/goalfieldrndbtn.png')}
        style={styles.iconBtnOuter}
      >
        {icon}
      </ImageBackground>
    </TouchableOpacity>
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
