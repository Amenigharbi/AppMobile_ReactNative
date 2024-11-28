import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ListProfil from './Home/ListProfil';
import Groupe from './Home/Groupe';
import MyProfils from './Home/MyProfil';
import Chat from './Chat';  // Import Chat screen

const Tab = createMaterialBottomTabNavigator();

const Acceuil = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Profiles" component={ListProfil} />
      <Tab.Screen name="Group" component={Groupe} />
      <Tab.Screen name="MyProfile" component={MyProfils} />
      <Tab.Screen name="Chat" component={Chat} /> 
    </Tab.Navigator>
  );
};

export default Acceuil;
