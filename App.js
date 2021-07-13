

import 'react-native-gesture-handler';
import * as React from 'react';
import { StatusBar, LogBox, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import Chat from './src/screen/chat'
import Login from './src/screen/login'
import { store } from './src/redux/store'
LogBox.ignoreAllLogs(false);


const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar hidden={true} />
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="Login" component={Login} />
          </Stack.Navigator>
        </NavigationContainer>
      </View >
    </Provider>

  );
}

