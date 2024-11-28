import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Chat() {
  return (
    <View style={styles.container}>
      <View style={styles.chatCard}>
        <Text style={styles.chatHeader}>💬 Chat Room</Text>
        <Text style={styles.chatMessage}>Welcome to the chat!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8', 
  },
  chatCard: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Shadow for Android
    alignItems: 'center',
  },
  chatHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chatMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
