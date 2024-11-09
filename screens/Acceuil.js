import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ListProfil from './Home/ListProfil';
import Groupe from './Home/Groupe';
import MyProfil from './Home/MyProfil';

const Tab = createMaterialBottomTabNavigator();

export default function Acceuil() {
  return (
    <Tab.Navigator
      initialRouteName="ListProfile"
      barStyle={styles.tabBar}
      screenOptions={{
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tab.Screen name="ListProfile" component={ListProfil} options={{ tabBarLabel: 'Profile List' }} />
      <Tab.Screen name="Groupe" component={Groupe} options={{ tabBarLabel: 'Group' }} />
      <Tab.Screen name="MyProfil" component={MyProfil} options={{ tabBarLabel: 'My Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#800040', // Dark red color for the tab bar background
    paddingVertical: 5,
  },
  tabLabel: {
    fontSize: 12,
    color: '#fff', // White color for the label text
  },
  tabIcon: {
    color: '#ffcc00', // Yellow color for icons
  },
});
