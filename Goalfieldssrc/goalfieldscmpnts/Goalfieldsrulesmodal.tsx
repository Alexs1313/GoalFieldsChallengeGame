// Rules modal component

import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { NeonModalTall } from '../goalfieldsscrns/Home';

import React, { useEffect, useRef } from 'react';
type GoalfieldsRulesModalProps = {
  rulesVisible: boolean;
  setRulesVisible: (value: boolean) => void;
};

const GoalfieldsRulesModal: React.FC<GoalfieldsRulesModalProps> = ({
  rulesVisible,
  setRulesVisible,
}) => {
  const appearAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!rulesVisible) return;
    appearAnim.setValue(0);
    Animated.timing(appearAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [rulesVisible, appearAnim]);

  return (
    <Modal visible={rulesVisible} transparent animationType="fade">
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
          <NeonModalTall
            title="Game Rules"
            onClose={() => setRulesVisible(false)}
          >
            <Text style={styles.rulesText}>
              Guide the ball from the top of the field to the goal at the bottom
              by tapping the grass platforms. Before each move, you see a hint
              for the current row (for example: "This row has 2 spikes"), but
              not the exact spike positions. If you hit a spike, the ball pops
              and you restart the attempt. You have one "Safe Move" per attempt,
              which gives one guaranteed safe step and then becomes unavailable.
              Every row always has at least one safe platform, so every level is
              beatable. Reach the goal to unlock the next level and view your
              attempts and safe guess percentage.
            </Text>
          </NeonModalTall>
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
  rulesText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default GoalfieldsRulesModal;
