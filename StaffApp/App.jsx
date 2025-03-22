// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/Navigation";
import { Provider } from "react-redux";
import { store } from './src/redux/store';
import "react-native-gesture-handler";

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
