import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { store, persistor } from './store';
import AppNavigator from './navigation/AppNavigator';
import { theme } from './theme';
import Toast from 'react-native-toast-message';
import { AppProvider } from './contexts';
import { ActivityIndicator, View } from 'react-native';

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
        persistor={persistor}
      >
        <PaperProvider theme={theme}>
          <AppProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <Toast />
          </AppProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
