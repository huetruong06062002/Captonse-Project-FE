import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/authReducer/authSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng từ AsyncStorage khi component được mount
    const fetchUserInfo = async () => {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      const fullName = await AsyncStorage.getItem("fullName");
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      const role = await AsyncStorage.getItem("role");

      setUserInfo({ token, userId, fullName, phoneNumber, role });
    };

    fetchUserInfo();
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {userInfo ? (
        <>
          <Text>Welcome, {userInfo.fullName}</Text>
          <Text>Role: {userInfo.role}</Text>
          <Text>Phone Number: {userInfo.phoneNumber}</Text>
        </>
      ) : (
        <Text>Loading user info...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    fontSize: 16,
  },
});
