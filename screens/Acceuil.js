import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import ListProfil from './Home/ListProfil';
import Groupe from './Home/Groupe';
import MyProfils from './Home/MyProfil';
import Chat from './Chat';  // Import Chat screen



export default function Acceuil(props)
{
  const Tab = createMaterialBottomTabNavigator();
  const { currentid } = props.route.params; 


   
  return (
    <Tab.Navigator>
      <Tab.Screen name="Profiles" component={ListProfil}initialParams={{currentid:currentid}} />
      <Tab.Screen name="Group" component={Groupe} />
      <Tab.Screen name="MyProfile" component={MyProfils} initialParams={{currentid:currentid}} />
      <Tab.Screen name="Chat" component={Chat}initialParams={{currentid:currentid}} /> 
    </Tab.Navigator>
  );
};
