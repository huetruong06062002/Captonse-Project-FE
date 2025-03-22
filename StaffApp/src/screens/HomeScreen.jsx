import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/features/authReducer/authSlice';

export default function HomeScreen({ navigation }) {

  const { username, isAuthenticated } = useSelector((state) => state.auth);
  console.log(username, isAuthenticated);
  const dispatch = useDispatch();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {isAuthenticated ? (
        <>
          <Text>Welcome, {username}</Text>
          <TouchableOpacity onPress={() => dispatch(logout())}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Please login first</Text>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Details')}>
        <Text>Go to Details Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    fontSize: 16,
  },
});