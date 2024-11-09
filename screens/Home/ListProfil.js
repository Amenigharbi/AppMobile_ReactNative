import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ListProfil() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Voici le contenu de la liste des profils</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
