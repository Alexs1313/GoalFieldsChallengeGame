// Main APP component

import React from 'react';
import { NavigationContainer as CoreNavpWrap } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import StackNavigator from './Goalfieldssrc/goalfieldsnav/StackNavigator';
import { ContextProvider } from './Goalfieldssrc/goalfieldsstrg/context';

const App: React.FC = () => {
  return (
    <CoreNavpWrap>
      <ContextProvider>
        <StackNavigator />
        <Toast position="top" topOffset={45} />
      </ContextProvider>
    </CoreNavpWrap>
  );
};

export default App;
