// src/navigation/Navigation.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from 'react-native-vector-icons';

import ProfileScreen from '../screens/ProfileScreen';

import HomeStackScreen from './HomeStackScreen';
import DetailsScreen from '../screens/DetailScreen';
import LoginScreen from '../screens/LoginScreen';
import WelcomeScreen from '../screens/WelcomeScren';
import ChatScreen from '../screens/ChatScreen';
import TaskScreen from '../screens/TaskScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Task') {
            iconName = 'clipboard-text';
          } else if (route.name === 'Chat') {
            iconName = 'chat';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Task" component={TaskScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (

      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}  // Ẩn header của trang Welcome
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}  // Ẩn header của trang Login
        />
        {/* Trang Home sẽ có header riêng, sử dụng TabNavigator */}
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}  // Ẩn header của Stack.Screen này, header được quản lý trong HomeStackScreen
        />
        {/* Thêm màn hình Details vào Stack Navigator */}
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ headerShown: true, title: 'Details Page' }}  // Tùy chỉnh header cho trang Details
        />
      </Stack.Navigator>

  );
};
