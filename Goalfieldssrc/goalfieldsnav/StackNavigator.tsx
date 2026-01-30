import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Home from '../goalfieldsscrns/Home';
import Onboard from '../goalfieldsscrns/Onboard';
import Loader from '../goalfieldsscrns/Loader';
import FieldsGoalGame from '../goalfieldsscrns/FieldsGoalGame';

export type RootStackParamList = {
  Loader: undefined;
  Onboard: undefined;
  Home: undefined;
  FieldsGoalGame: { level: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loader" component={Loader} />
      <Stack.Screen name="Onboard" component={Onboard} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="FieldsGoalGame" component={FieldsGoalGame} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
