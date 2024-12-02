import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function Groupe() {
  const [groups, setGroups] = useState([
    { id: '1', name: 'Développeurs' },
    { id: '2', name: 'Designers' },
    { id: '3', name: 'Marketing' },
    { id: '4', name: 'Gestion de projet' },
  ]);

  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groupes disponibles</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.groupItem,
              selectedGroup?.id === item.id && styles.selectedGroupItem,
            ]}
            onPress={() => handleSelectGroup(item)}
          >
            <Text style={styles.groupText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedGroup && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>
            Vous avez sélectionné : {selectedGroup.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f5f2', // Fond gris clair
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#a64b2a', // Marron pour le titre
    marginTop: 40,
  },
  groupItem: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#ffe8d6', // Fond orange pâle
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cc8c58', // Orange foncé pour les bordures
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedGroupItem: {
    backgroundColor: '#cc8c58', // Orange foncé pour le groupe sélectionné
    borderColor: '#8c4d26', // Marron pour les bordures du groupe sélectionné
  },
  groupText: {
    fontSize: 18,
    color: '#4a3f35', // Marron foncé pour le texte
    fontWeight: '500',
  },
  detailsContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1c4b2', // Gris clair pour les bordures
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 18,
    color: '#cc8c58', // Orange foncé pour le texte des détails
    fontWeight: '600',
  },
});
