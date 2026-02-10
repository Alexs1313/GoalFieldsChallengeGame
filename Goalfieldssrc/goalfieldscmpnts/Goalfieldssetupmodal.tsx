import React, { useMemo } from 'react';
import { Image, Modal, Platform, useWindowDimensions, View } from 'react-native';
import { NeonModalSquare } from '../goalfieldsscrns/Home';
import Goalfieldsetupiconbtn from './Goalfieldsetupiconbtn';

const REF_WIDTH = 375;
const REF_HEIGHT = 812;

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
  const { width, height } = useWindowDimensions();
  const rw = width / REF_WIDTH;
  const rh = height / REF_HEIGHT;
  const rs = Math.min(rw, rh, 1.2);

  const s = useMemo(
    () => ({
      modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      setupRow: {
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        width: '100%' as const,
        marginTop: Math.round(29 * rh),
        gap: Math.round(20 * rw),
      },
      spacer: { height: Math.round(18 * rs) },
    }),
    [rw, rh, rs],
  );

  return (
    <Modal
      visible={setupVisible}
      transparent
      animationType="fade"
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={s.modalBackdrop}>
        <NeonModalSquare
          title="Game Setup"
          onClose={() => setSetupVisible(false)}
        >
          <View style={s.setupRow}>
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

          <View style={s.spacer} />
        </NeonModalSquare>
      </View>
    </Modal>
  );
};

export default GoalfieldsSetupModal;
