import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { NeonModalTall } from '../goalfieldsscrns/Home';

type GoalfieldsRulesModalProps = {
  rulesVisible: boolean;
  setRulesVisible: (value: boolean) => void;
};

const GoalfieldsRulesModal: React.FC<GoalfieldsRulesModalProps> = ({
  rulesVisible,
  setRulesVisible,
}) => {
  return (
    <Modal visible={rulesVisible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <NeonModalTall
          title="Game Rules"
          onClose={() => setRulesVisible(false)}
        >
          <Text style={styles.rulesText}>
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

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default GoalfieldsRulesModal;
