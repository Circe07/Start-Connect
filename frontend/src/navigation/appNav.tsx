import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '@/mvp/theme/tokens';
import HomeLandingScreen from '@/mvp/screens/HomeLandingScreen';
import ExperiencesListScreen from '@/mvp/screens/ExperiencesListScreen';
import ExperienceDetailScreen from '@/mvp/screens/ExperienceDetailScreen';
import BookingFormScreen from '@/mvp/screens/BookingFormScreen';
import BookingConfirmationScreen from '@/mvp/screens/BookingConfirmationScreen';
import MyBookingsScreen from '@/mvp/screens/MyBookingsScreen';
import ProgressScreen from '@/mvp/screens/ProgressScreen';
import CommunityScreen from '@/mvp/screens/CommunityScreen';
import PostSessionFeedbackScreen from '@/mvp/screens/PostSessionFeedbackScreen';
import { Experience } from '@/mvp/types';

export type ExperiencesStackParamList = {
  HomeLanding: undefined;
  ExperiencesList: undefined;
  ExperienceDetail: { experience: Experience };
  BookingForm: { experience: Experience };
  BookingConfirmation: { experience: Experience };
};

export type MyBookingsStackParamList = {
  MyBookingsMain: undefined;
  PostSessionFeedback: { bookingId: string };
};

const ExperiencesStack = createStackNavigator<ExperiencesStackParamList>();
const BookingsStack = createStackNavigator<MyBookingsStackParamList>();
const Tabs = createBottomTabNavigator();

function ExperiencesNavigator() {
  return (
    <ExperiencesStack.Navigator screenOptions={{ headerShown: false }}>
      <ExperiencesStack.Screen name="HomeLanding" component={HomeLandingScreen} />
      <ExperiencesStack.Screen name="ExperiencesList" component={ExperiencesListScreen} />
      <ExperiencesStack.Screen name="ExperienceDetail" component={ExperienceDetailScreen} />
      <ExperiencesStack.Screen name="BookingForm" component={BookingFormScreen} />
      <ExperiencesStack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
      />
    </ExperiencesStack.Navigator>
  );
}

function MyBookingsNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="MyBookingsMain" component={MyBookingsScreen} />
      <BookingsStack.Screen name="PostSessionFeedback" component={PostSessionFeedbackScreen} />
    </BookingsStack.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.surface },
          tabBarIcon: ({ color, size }) => {
            const names: Record<string, string> = {
              Experiences: 'sports-tennis',
              MyBookings: 'event-note',
              Progress: 'timeline',
              Community: 'groups',
            };
            return <Icon name={names[route.name] || 'circle'} color={color} size={size} />;
          },
        })}
      >
        <Tabs.Screen
          name="Experiences"
          component={ExperiencesNavigator}
          options={{ title: 'Experiences' }}
        />
        <Tabs.Screen
          name="MyBookings"
          component={MyBookingsNavigator}
          options={{ title: 'My bookings' }}
        />
        <Tabs.Screen name="Progress" component={ProgressScreen} />
        <Tabs.Screen name="Community" component={CommunityScreen} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
