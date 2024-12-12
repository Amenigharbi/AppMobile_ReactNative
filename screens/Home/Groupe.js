import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, StatusBar } from 'react-native';
import firebase from '../../Config';
import { Ionicons } from '@expo/vector-icons'; // Importer Ionicons

const database = firebase.database();

export default function Groupe({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);  // State to toggle the creation form
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
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
        setIsCreatingGroup(false); // Close the form after creation
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
  const handleLogout = () => {
    firebase.auth().signOut()
      .then(() => {
        navigation.replace("Authentification");
      })
      .catch((error) => {
        Alert.alert("Erreur", error.message); 
      });
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
      style={[styles.userItem, selectedUsers.includes(item.id) && styles.selectedUserItem]}
    >
      <Text style={styles.userText}>{item.nom || 'Utilisateur'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
  
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
  
      {isCreatingGroup && (
        <View style={styles.createGroupForm}>
          <Text style={styles.sectionTitle}>Créer un Groupe</Text>
  
          {/* Champ pour le nom du groupe */}
          <TextInput
            style={styles.input}
            placeholder="Nom du groupe"
            value={newGroupName}
            onChangeText={setNewGroupName}
          />
  
          {/* Liste des utilisateurs */}
          <FlatList
            data={users.filter((user) => user.id !== currentUser.uid)} // Exclure l'utilisateur courant
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            style={styles.userList}
          />
  
          {/* Conteneur pour les boutons */}
          <View style={styles.buttonContainer}>
            {/* Bouton "Revenir" */}
            <TouchableOpacity onPress={() => setIsCreatingGroup(false)} style={styles.backButton}>
              <Text style={styles.backButtonText}>Revenir</Text>
            </TouchableOpacity>
  
            {/* Bouton "Créer un Groupe" */}
            <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
              <Text style={styles.createGroupButtonText}>Créer un Groupe</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
  
      {/* Bouton "+" affiché uniquement si isCreatingGroup est faux */}
      {!isCreatingGroup && (
        <TouchableOpacity
          style={styles.addGroupButton}
          onPress={() => setIsCreatingGroup(true)}
        >
          <Text style={styles.addGroupButtonText}>+</Text>
        </TouchableOpacity>
      )}
       <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    backgroundColor: '#f9f9f9', 
  },
  title: {
    marginTop: 20,
    fontSize: 26, 
    fontWeight: '700', 
    color: '#2d3436', 
    marginBottom: 20,
    textAlign: 'center',
  },
  groupItem: {
    padding: 18,
    marginVertical: 12,
    backgroundColor: '#ffffff', 
    borderRadius: 12,
    shadowColor: '#000', 
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6, 
    borderWidth: 0.5, 
    borderColor: '#ddd', 
  },
  groupText: {
    fontSize: 20,
    color: '#2c3e50',
    fontWeight: '500',
  },
  noGroupText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e67e22',
    marginTop: 25,
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#dcdcdc',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    marginVertical: 20,
    fontSize: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#ccc',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userList: {
    maxHeight: 180,
    marginVertical: 10,
  },
  userItem: {
    padding: 16,
    marginVertical: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  selectedUserItem: {
    backgroundColor: '#1abc9c',
    borderWidth: 1,
    borderColor: '#16a085',
  },
  userText: {
    fontSize: 17,
    color: '#2c3e50',
  },
  createGroupButton: {
    marginTop: 30,
    paddingVertical: 16,
    backgroundColor: '#3498db',
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  createGroupButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  addGroupButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3498db',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  addGroupButtonText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  createGroupForm: {
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e74c3c',
    borderRadius: 30,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 30,
    alignItems: 'center',
  },
  createGroupButton: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 10,
    backgroundColor: '#3498db',
    borderRadius: 30,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  createGroupButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute', // Permet de le positionner précisément
    top: 50, // Distance du haut
    right: 20, // Distance de la droite
    backgroundColor: '#e74c3c', // Couleur rouge
    width: 50, // Largeur du bouton
    height: 50, // Hauteur du bouton
    borderRadius: 25, // Forme circulaire
    justifyContent: 'center', // Centre le contenu verticalement
    alignItems: 'center', // Centre le contenu horizontalement
    shadowColor: '#000', // Ajout d'une ombre
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  
  
});
