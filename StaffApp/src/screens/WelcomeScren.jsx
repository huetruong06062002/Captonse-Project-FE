// src/screens/DetailsScreen.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
 useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');  // Sau 3 giây, chuyển đến trang Login
    }, 3000);

    return () => clearTimeout(timer);  // Dọn dẹp timer khi component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text>Welcome to the App!</Text>
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