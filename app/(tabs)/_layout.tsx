import { HapticTab } from '@/components/HapticTab';
import { colors } from '@/utils/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.blue[300],
        tabBarInactiveTintColor: colors.slate[950],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.slate[950],
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <MaterialIcons name="home" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="nudges"
        options={{
          title: 'Nudges',
          tabBarIcon: () => <MaterialCommunityIcons name="chat" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: () => <MaterialCommunityIcons name="calendar" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: () => <MaterialIcons name="settings" size={24} color="black" />,
        }}
      />
    </Tabs>
  );
}
