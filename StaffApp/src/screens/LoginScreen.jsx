// src/screens/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/features/authReducer/authSlice';
import axiosInstance from '../utils/axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        phoneNumber: username,
        password,
      });

      // Lưu trữ token và thông tin user vào Redux và AsyncStorage
      const { token, refreshToken, userId, fullName, phoneNumber, role } = response.data;

      dispatch(setCredentials({ token, userId, fullName, phoneNumber, role }));

      // Lưu trữ dữ liệu vào AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('fullName', fullName);
      await AsyncStorage.setItem('phoneNumber', phoneNumber);
      await AsyncStorage.setItem('role', role);

      console.log('Login successful:', response.data);

      // Chuyển hướng người dùng đến Home sau khi đăng nhập thành công
      navigation.replace('Home');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      alert('Invalid credentials');
    }
  };
  return (
    <View style={styles.container}>
      <Text>Login Screen</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginBottom: 10,
    paddingLeft: 10,
  },
  item: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    fontSize: 16,
  },
});