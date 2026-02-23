// navigation

import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// components
import Home from '../goalfieldsscrns/Home';
import Onboard from '../goalfieldsscrns/Onboard';
import Loader from '../goalfieldsscrns/Loader';
import FieldsGoalGame from '../goalfieldsscrns/FieldsGoalGame';

// types
export type StackList = {
  Loader: undefined;
  Onboard: undefined;
  Home: undefined;
  FieldsGoalGame: { level: number };
};

const BasicRouter = createStackNavigator<StackList>();

const StackNavigator: React.FC = () => {
  return (
    <BasicRouter.Navigator screenOptions={{ headerShown: false }}>
      <BasicRouter.Screen name="Loader" component={Loader} />
      <BasicRouter.Screen name="Onboard" component={Onboar} />
      <BasicRouter.Screen name="Home" component={Home} />
      <BasicRouter.Screen name="FieldsGoalGame" component={FieldsGoalGame} />
    </BasicRouter.Navigator>
  );
};

export default StackNavigator;
