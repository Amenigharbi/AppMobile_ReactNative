import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importer des icônes
import ListProfil from './Home/ListProfil';
import Groupe from './Home/Groupe';
import MyProfils from './Home/MyProfil';
export default function Acceuil(props) {
  const Tab = createMaterialBottomTabNavigator();
  const { currentid } = props.route.params;

  return (
    <Tab.Navigator
      initialRouteName="Profiles"
      shifting={true} // Ajoute un effet de transition entre les onglets
      barStyle={{ backgroundColor: '#FFA726' }} // Couleur de la barre inférieure (orange clair)
    >
      <Tab.Screen
        name="Profiles"
        component={ListProfil}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'Profiles',
          tabBarIcon: ({ color }) => (
            <Icon name="account-group" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Groupe"
        component={Groupe}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color }) => (
            <Icon name="account-multiple" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="MyProfile"
        component={MyProfils}
        initialParams={{ currentid: currentid }}
        options={{
          tabBarLabel: 'My Profile',
          tabBarIcon: ({ color }) => (
            <Icon name="account-circle" color={color} size={24} />
          ),
        }}
      />


    </Tab.Navigator>
  );
}
