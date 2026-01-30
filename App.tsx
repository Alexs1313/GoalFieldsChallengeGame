import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import StackNavigator from './Goalfieldssrc/goalfieldsnav/StackNavigator';
import { ContextProvider } from './Goalfieldssrc/goalfieldsstrg/context';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <ContextProvider>
        <StackNavigator />
        <Toast position="top" topOffset={45} />
      </ContextProvider>
    </NavigationContainer>
  );
};

export default App;
