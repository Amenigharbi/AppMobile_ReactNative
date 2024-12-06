import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import firebase from '../../Config'; // Assurez-vous que votre configuration Firebase est correcte

const database = firebase.database();

export default function Groupe({ navigation }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur connecté
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      setCurrentUserId(currentUser.uid);
    }

    // Charger les utilisateurs depuis Firebase
    const refProfiles = database.ref('lesprofiles');
    refProfiles.on('value', (snapshot) => {
      const fetchedUsers = [];
      snapshot.forEach((child) => {
        const user = child.val();
        fetchedUsers.push(user);
      });
      setUsers(fetchedUsers);
    });

    return () => refProfiles.off('value'); // Nettoyer l'écouteur Firebase
  }, []);

  const handleSelectUser = (user) => {
    // Ajouter ou retirer un utilisateur de la sélection
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id); // Désélectionner
      }
      return [...prev, user]; // Sélectionner
    });
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      Alert.alert('Erreur', 'Sélectionnez au moins deux utilisateurs pour créer un groupe.');
      return;
    }

    // Créer une nouvelle conversation de groupe
    const groupRef = database.ref('lesdiscussions').push(); // Crée un nouvel identifiant pour la discussion
    const groupId = groupRef.key;

    // Ajouter les utilisateurs à la discussion de groupe
    const groupData = {
      participants: selectedUsers.map((user) => user.id), // ID des utilisateurs dans le groupe
      groupName: `Groupe ${selectedUsers.length} utilisateurs`,
      createdBy: currentUserId,
      timeCreated: new Date().toISOString(),
    };

    // Sauvegarder les informations de groupe dans la base de données
    groupRef.set(groupData);

    // Naviguer vers le chat de groupe
    navigation.navigate('Chat', { groupId, selectedUsers });
  };

  const handleOpenChat = () => {
    if (selectedUsers.length < 2) {
      Alert.alert('Erreur', 'Sélectionnez au moins deux utilisateurs pour créer un groupe.');
      return;
    }

    handleCreateGroup();
  };

  const renderUser = ({ item }) => {
    // Ne pas afficher l'utilisateur connecté dans la liste
    if (item.id === currentUserId) {
      return null;
    }

    const isSelected = selectedUsers.some((user) => user.id === item.id);

    return (
      <TouchableOpacity
        onPress={() => handleSelectUser(item)}
        style={[styles.groupItem, isSelected && styles.selectedGroupItem]}
      >
        <Text style={styles.groupText}>{item.pseudo || 'Utilisateur'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionnez des utilisateurs</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
      />
      <TouchableOpacity
        style={styles.chatButton}
        onPress={handleOpenChat}
        disabled={selectedUsers.length < 2}
      >
        <Text style={styles.chatButtonText}>
          {selectedUsers.length < 2 ? 'Sélectionnez des utilisateurs' : 'Créer un Groupe'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f5f2',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#a64b2a',
    marginTop: 40,
  },
  groupItem: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#ffe8d6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cc8c58',
  },
  selectedGroupItem: {
    backgroundColor: '#cc8c58',
    borderColor: '#8c4d26',
  },
  groupText: {
    fontSize: 18,
    color: '#4a3f35',
    fontWeight: '500',
  },
  chatButton: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: '#cc8c58',
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
