import React, { useMemo } from 'react';
import { Modal, Platform, Text, useWindowDimensions, View } from 'react-native';
import { NeonModalTall } from '../goalfieldsscrns/Home';

const REF_WIDTH = 375;
const REF_HEIGHT = 812;

type GoalfieldsRulesModalProps = {
  rulesVisible: boolean;
  setRulesVisible: (value: boolean) => void;
};

const GoalfieldsRulesModal: React.FC<GoalfieldsRulesModalProps> = ({
  rulesVisible,
  setRulesVisible,
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
      rulesText: {
        color: '#FFFFFF',
        fontSize: Math.round(21 * rs),
        lineHeight: Math.round(22 * rs),
        textAlign: 'center' as const,
      },
    }),
    [rs],
  );

  return (
    <Modal
      visible={rulesVisible}
      transparent
      animationType="fade"
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={s.modalBackdrop}>
        <NeonModalTall
          title="Game Rules"
          onClose={() => setRulesVisible(false)}
        >
          <Text style={s.rulesText}>
            Guide the ball from the top of the field to the goal at the bottom
            by tapping on the round grass platforms. Some platforms contain
            hidden spikes. If you step on one, the ball pops and the level
            restarts. After you safely pass a row, all spikes in that row are
            revealed. Use this information to remember where the traps are and
            choose a safe path forward. Every row always has at least one safe
            platform, so each level can be completed. Your task is to avoid the
            spikes, reach the goal, and unlock the next level.
          </Text>
        </NeonModalTall>
      </View>
    </Modal>
  );
};

export default GoalfieldsRulesModal;
