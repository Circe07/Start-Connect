import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LandingScreen from '@/screens/auth/LandingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import HomeScreen from '@/screens/HomeScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ChatScreen from '@/screens/chat/ChatScreen';
import GroupsScreen from '@/screens/groups/GroupsScreen';
import CentersScreen from '@/screens/centers/CentersScreen';
import CenterDetailScreen from '@/screens/centers/CenterDetailScreen';
import MyReservationsScreen from '@/screens/centers/MyReservationsScreen';
import ReservationScreen from '@/screens/centers/ReservationScreen';
import CreatePostScreen from '@/screens/posts/CreatePostScreen';
import ChatListScreen from '@/screens/chat/ChatListScreen';
import ForgotPassword from '@/screens/auth/ForgotPassword';
import PaymentScreen from '@/screens/payment/PaymentScreen';
import SearchUser from '@/screens/SearchUser';
import FriendsScreen from '@/screens/friends/FriendsScreen';

const Stack = createStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
        <Stack.Screen name="SearchUser" component={SearchUser} />
        <Stack.Screen name="Friends" component={FriendsScreen} />
        <Stack.Screen name="Groups" component={GroupsScreen} />
        <Stack.Screen name="Centers" component={CentersScreen} />
        <Stack.Screen name="CenterDetail" component={CenterDetailScreen} />
        <Stack.Screen name="MyReservations" component={MyReservationsScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
