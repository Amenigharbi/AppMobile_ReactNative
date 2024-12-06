import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import firebase from '../../Config';

const database = firebase.database();

export default function Groupe({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    // Fetch groups
    const fetchGroups = () => {
      const groupsRef = database.ref('lesdiscussions');
      groupsRef.on('value', (snapshot) => {
        const fetchedGroups = [];
        snapshot.forEach((child) => {
          fetchedGroups.push({ id: child.key, ...child.val() });
        });
        setGroups(fetchedGroups);

        const userGroups = fetchedGroups.filter((group) =>
          Array.isArray(group.participants) && group.participants.includes(currentUser.uid)
        );
        setMyGroups(userGroups);
      });
    };

    // Fetch users
    const fetchUsers = () => {
      const usersRef = database.ref('lesprofiles');
      usersRef.on('value', (snapshot) => {
        const fetchedUsers = [];
        snapshot.forEach((child) => {
          fetchedUsers.push({ id: child.key, ...child.val() });
        });
        console.log(fetchedUsers);
        setUsers(fetchedUsers);
      });
    };

    fetchGroups();
    fetchUsers();

    return () => {
      database.ref('lesdiscussions').off('value');
      database.ref('lesprofiles').off('value');
    };
  }, [currentUser.uid]);

  const handleNavigateToChat = (groupId) => {
    navigation.navigate('ChatGroup', { groupId });
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de groupe.');
      return;
    }
    if (selectedUsers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un utilisateur.');
      return;
    }

    const groupData = {
      groupName: newGroupName,
      participants: [...selectedUsers, currentUser.uid], // Include current user
    };

    database
      .ref('lesdiscussions')
      .push(groupData)
      .then(() => {
        Alert.alert('Succès', 'Groupe créé avec succès !');
        setNewGroupName('');
        setSelectedUsers([]);
      })
      .catch((error) => {
        Alert.alert('Erreur', `Impossible de créer le groupe : ${error.message}`);
      });
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleNavigateToChat(item.id)}
      style={styles.groupItem}
    >
      <Text style={styles.groupText}>{item.groupName || 'Groupe'}</Text>
    </TouchableOpacity>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleUserSelection(item.id)}
      style={[
        styles.userItem,
        selectedUsers.includes(item.id) && styles.selectedUserItem,
      ]}
    >
      <Text style={styles.userText}>{item.nom || 'Utilisateur'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Groupes</Text>
      {myGroups.length > 0 ? (
        <FlatList
          data={myGroups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroup}
        />
      ) : (
        <Text style={styles.noGroupText}>Vous n'êtes membre d'aucun groupe.</Text>
      )}

      <Text style={styles.sectionTitle}>Créer un Groupe</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom du groupe"
        value={newGroupName}
        onChangeText={setNewGroupName}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        style={styles.userList}
      />
      <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
        <Text style={styles.createGroupButtonText}>Créer un Groupe</Text>
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
  groupText: {
    fontSize: 18,
    color: '#4a3f35',
    fontWeight: '500',
  },
  noGroupText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#a64b2a',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  userList: {
    maxHeight: 150,
    marginVertical: 10,
  },
  userItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
  },
  selectedUserItem: {
    backgroundColor: '#4dd0e1',
  },
  userText: {
    fontSize: 16,
    color: '#00796b',
  },
  createGroupButton: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: '#cc8c58',
    borderRadius: 12,
    alignItems: 'center',
  },
  createGroupButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
