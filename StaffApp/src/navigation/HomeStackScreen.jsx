// src/navigation/HomeStackScreen.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
const HomeStack = createNativeStackNavigator();

export default function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true, // Hiển thị header cho màn hình Home
          headerStyle: {
            backgroundColor: "#f8f8f8", // Màu nền header
          },
          headerTintColor: "#333", // Màu chữ
          headerTitleStyle: {
            fontWeight: "bold", // Phong cách chữ tiêu đề
          },
          headerTitle: "Dashboard", // Tiêu đề của trang Home
          headerRight: () => (
            <TouchableOpacity onPress={() => alert("Settings")}>
              <MaterialCommunityIcons name="settings" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
    </HomeStack.Navigator>
  );
}
