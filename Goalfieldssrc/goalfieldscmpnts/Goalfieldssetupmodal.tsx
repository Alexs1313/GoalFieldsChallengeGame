// Settings modal component

import { Animated, Easing, Image, Modal, StyleSheet, View } from 'react-native';

import { NeonModalSquare } from '../goalfieldsscrns/Home';

import Goalfieldsetupiconbtn from './Goalfieldsetupiconbtn';

import React, { useEffect, useRef } from 'react';

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
  isEnabledSound,
  toggleMusic,
  isEnabledNotifications,
  toggleNotifications,
  isEnabledVibration,
  toggleVibration,
  handleShare,
}) => {
  const appearAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!setupVisible) return;
    appearAnim.setValue(0);
    Animated.timing(appearAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [setupVisible, appearAnim]);

  return (
    <Modal visible={setupVisible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <Animated.View
          style={{
            opacity: appearAnim,
            transform: [
              {
                scale: appearAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1],
                }),
              },
            ],
          }}
        >
          <NeonModalSquare
            title="Game Setup"
            onClose={() => setSetupVisible(false)}
          >
            <View style={styles.setupRow}>
              <Goalfieldsetupiconbtn
                onPress={() => toggleMusic(!isEnabledSound)}
                icon={
                  isEnabledSound ? (
                    <Image
                      source={require('../../assets/images/musicon.png')}
                    />
                  ) : (
                    <Image
                      source={require('../../assets/images/musicoff.png')}
                      style={{ right: 2, top: 1 }}
                    />
                  )
                }
              />

              <Goalfieldsetupiconbtn
                onPress={() => toggleNotifications(!isEnabledNotifications)}
                icon={
                  isEnabledNotifications ? (
                    <Image source={require('../../assets/images/notfon.png')} />
                  ) : (
                    <Image
                      source={require('../../assets/images/notfoff.png')}
                      style={{ right: 2, top: 3 }}
                    />
                  )
                }
              />

              <Goalfieldsetupiconbtn
                onPress={() => toggleVibration(!isEnabledVibration)}
                icon={
                  isEnabledVibration ? (
                    <Image
                      source={require('../../assets/images/vibroon.png')}
                    />
                  ) : (
                    <Image
                      source={require('../../assets/images/vibrooff.png')}
                    />
                  )
                }
              />
            </View>

            <View style={{ height: 18 }} />

            <View style={{ alignItems: 'center' }}>
              <Goalfieldsetupiconbtn
                onPress={handleShare}
                icon={
                  <Image
                    source={require('../../assets/images/mdi_share.png')}
                    style={{ top: -2 }}
                  />
                }
              />
            </View>
          </NeonModalSquare>
        </Animated.View>
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
  },
});

export default GoalfieldsSetupModal;
