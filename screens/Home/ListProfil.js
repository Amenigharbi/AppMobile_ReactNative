import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ImageBackground, 
  StatusBar, 
  Alert, 
  TouchableOpacity, 
  Linking 
} from 'react-native';
import firebase from '../../Config';
import Icon from 'react-native-vector-icons/MaterialIcons';

const database = firebase.database();
const ref_lesprofiles = database.ref('lesprofiles');

export default function ListProfil(props) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      ref_lesprofiles.on('value', (snapshot) => {
        const profiles = [];
        snapshot.forEach((unprofile) => {
          profiles.push({ key: unprofile.key, ...unprofile.val() }); // Inclure la clé
        });
        setData(profiles);
      });
    };

    fetchData();

    return () => {
      ref_lesprofiles.off();
    };
  }, []);

  const handleChat = (nom) => {
    props.navigation.navigate('Chat', { nom });
  };

  const handleCall = (telephone) => {
    const phoneNumber = `tel:${telephone}`;
    Linking.openURL(phoneNumber).catch(() => {
      Alert.alert('Error', 'Failed to initiate the call.');
    });
  };

  const handleDelete = (key) => {
    const profileRef = ref_lesprofiles.child(key);
    profileRef
      .remove()
      .then(() => {
        Alert.alert('Success', 'Profile deleted successfully.');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <ImageBackground source={require('../../assets/hhh.jpg')} style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.textHeader}>My Profiles</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.key} // Utiliser la clé unique
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.textItem}>{item.nom}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => handleChat(item.nom)} style={styles.button}>
                <Icon name="chat" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleCall(item.telephone)} style={styles.button}>
                <Icon name="call" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.key)} style={styles.button}>
                <Icon name="delete" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
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
    width: '80%',
  },
  list: {
    backgroundColor: '#fff4',
    width: '95%',
  },
  itemContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
});
