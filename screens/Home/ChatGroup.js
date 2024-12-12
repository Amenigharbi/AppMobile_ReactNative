import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import firebase from '../../Config';

const database = firebase.database();

export default function ChatGroup({ route, navigation }) {
  const { groupId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
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

    fetchUsers();
    return () => database.ref('lesprofiles').off('value');
  }, []);

  useEffect(() => {
    const fetchMessages = () => {
      const messagesRef = database.ref(`lesdiscussions/${groupId}/messages`);
      messagesRef.on('value', (snapshot) => {
        const fetchedMessages = [];
        snapshot.forEach((child) => {
          fetchedMessages.push({ id: child.key, ...child.val() });
        });
        setMessages(fetchedMessages);
      });
    };

    fetchMessages();
    return () => database.ref(`lesdiscussions/${groupId}/messages`).off('value');
  }, [groupId]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const messagesRef = database.ref(`lesdiscussions/${groupId}/messages`);
      const message = {
        text: newMessage,
        sender: currentUser.uid,
        timestamp: Date.now(),
      };
      messagesRef.push(message);
      setNewMessage('');
    }
  };

  const getUserName = (userId) => {
    const user = users.find(user => user.id === userId);
    return user ? user.nom : 'Utilisateur';
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageItem, item.sender === currentUser.uid ? styles.currentUserMessage : styles.otherUserMessage]}>
      <Text style={[styles.sender, item.sender === currentUser.uid ? styles.currentUserSender : styles.otherUserSender]}>
        {item.sender === currentUser.uid ? 'Moi' : getUserName(item.sender)}
      </Text>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Group Chat</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f5f2',
  },
  header: {
    height: 60,
    backgroundColor: '#3b75d6',  // Blue background for the header
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesList: {
    padding: 10,
    paddingBottom: 60,  // To avoid overlapping with the input field
  },
  messageItem: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 15,
    maxWidth: '75%',
    backgroundColor: '#ffe8d6',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  currentUserMessage: {
    backgroundColor: '#d2e0ff',  // Light blue for the current user
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    backgroundColor: '#ffe8d6',  // Light beige for other users
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 14,
  },
  currentUserSender: {
    color: '#3b75d6',  // Blue color for current user
  },
  otherUserSender: {
    color: '#4a3f35',  // Darker color for others
  },
  messageText: {
    fontSize: 16,
    color: '#4a3f35',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f4f4f4',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#cc8c58',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

/*kol user connecté nzid + group fil page groupe thez page o5ra , chat paget wahadehom , bouton deconnecté min fou9 fil paget kol , bouton appelé  */