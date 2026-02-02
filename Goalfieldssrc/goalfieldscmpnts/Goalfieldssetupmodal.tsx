import React from 'react';
import { Image, Modal, Platform, StyleSheet, View } from 'react-native';
import { NeonModalSquare } from '../goalfieldsscrns/Home';
import Goalfieldsetupiconbtn from './Goalfieldsetupiconbtn';

type GoalfieldsSetupModalProps = {
  setupVisible: boolean;
  setSetupVisible: (value: boolean) => void;

  isEnabledSound: boolean;
  toggleMusic: (value: boolean) => void;

  isEnabledNotifications: boolean;
  toggleNotifications: (value: boolean) => void;

  isEnabledVibration: boolean;
  toggleVibration: (value: boolean) => void;

  handleShare: () => void;
};

const GoalfieldsSetupModal: React.FC<GoalfieldsSetupModalProps> = ({
  setupVisible,
  setSetupVisible,
  isEnabledNotifications,
  toggleNotifications,
  isEnabledVibration,
  toggleVibration,
}) => {
  return (
    <Modal
      visible={setupVisible}
      transparent
      animationType="fade"
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={styles.modalBackdrop}>
        <NeonModalSquare
          title="Game Setup"
          onClose={() => setSetupVisible(false)}
        >
          <View style={styles.setupRow}>
            <Goalfieldsetupiconbtn
              onPress={() => toggleNotifications(!isEnabledNotifications)}
              icon={
                isEnabledNotifications ? (
                  <Image source={require('../../assets/images/notfon.png')} />
                ) : (
                  <Image source={require('../../assets/images/notfoff.png')} />
                )
              }
            />

            <Goalfieldsetupiconbtn
              onPress={() => toggleVibration(!isEnabledVibration)}
              icon={
                isEnabledVibration ? (
                  <Image source={require('../../assets/images/vibroon.png')} />
                ) : (
                  <Image source={require('../../assets/images/vibrooff.png')} />
                )
              }
            />
          </View>

          <View style={{ height: 18 }} />
        </NeonModalSquare>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 30,
  },
});

export default GoalfieldsSetupModal;
