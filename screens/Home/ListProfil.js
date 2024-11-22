import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, StatusBar } from 'react-native';
import firebase from '../../Config';

const database = firebase.database();
const ref_lesprofiles = database.ref('lesprofiles');

export default function ListProfil(props) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      ref_lesprofiles.on('value', (snapshot) => {
        const profiles = [];
        snapshot.forEach((unprofile) => {
          profiles.push(unprofile.val());
        });
        setData(profiles);
      });
    };

    fetchData();

    return () => {
      ref_lesprofiles.off();
    };
  }, []);

  return (
    <ImageBackground source={require('../../assets/hhh.jpg')} style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.textHeader}>My Account</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()} // Unique key for each item
        renderItem={({ item }) => (
          <Text
            style={styles.textItem}
            onPress={() => {
              props.navigation.navigate('Chat', { nom: item.nom });
            }}
          >
            {item.nom}
          </Text>
        )}
        style={styles.list}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textHeader: {
    fontSize: 24,
    color: '#fff',
    marginVertical: 20,
  },
  textItem: {
    fontSize: 18,
    color: '#333',
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 5,
    textAlign: 'center',
  },
  list: {
    backgroundColor: '#fff4',
    width: '95%',
  },
});
