import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, BackHandler, Alert, FlatList } from "react-native";
import { Button, TextInput } from "react-native-paper";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export default function Authentification(props) {
  const [email, setEmail] = useState("Ameni@gmail.com");
  const [pwd, setPwd] = useState("1234567");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);  // Liste des groupes auxquels l'utilisateur appartient
  const refInput2 = useRef();
  const auth = firebase.auth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchUsers();
        fetchUserGroups(user.uid);  // Charger les groupes de l'utilisateur
      } else {
        setCurrentUser(null);
        setUsers([]);
        setGroups([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleExit = () => {
    BackHandler.exitApp();
  };

  const handleSignIn = () => {
    if (!email || !pwd) {
      Alert.alert("Erreur", "Veuillez entrer un email et un mot de passe.");
      return;
    }

    auth
      .signInWithEmailAndPassword(email, pwd)
      .then(() => {
        const currentid = auth.currentUser.uid;
        props.navigation.replace("Acceuil", { currentid });
      })
      .catch((error) => {
        Alert.alert("Échec de l'authentification", error.message);
      });
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        Alert.alert("Déconnexion", "Vous avez été déconnecté avec succès.");
      })
      .catch((error) => {
        Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion.");
      });
  };

  const fetchUsers = () => {
    const db = firebase.firestore();
    db.collection("users")
      .get()
      .then((querySnapshot) => {
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push(doc.data());
        });
        setUsers(usersList);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des utilisateurs: ", error);
      });
  };

  // Fonction pour récupérer les groupes de l'utilisateur
  const fetchUserGroups = (userId) => {
    const db = firebase.firestore();
    db.collection("groups") // Remplacez "groups" par votre collection de groupes
      .where("members", "array-contains", userId) // Récupérer les groupes où l'utilisateur est membre
      .get()
      .then((querySnapshot) => {
        const userGroups = [];
        querySnapshot.forEach((doc) => {
          userGroups.push(doc.data());
        });
        setGroups(userGroups);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des groupes: ", error);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.statusBar} />
      <ImageBackground source={require("../assets/orag.jpg")} style={styles.backgroundImage}>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Authentification</Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={() => refInput2.current.focus()}
            blurOnSubmit={false}
            keyboardType="email-address"
            mode="outlined"
            style={styles.authTextInput}
          />

          <TextInput
            ref={refInput2}
            label="Mot de passe"
            value={pwd}
            onChangeText={setPwd}
            secureTextEntry
            mode="outlined"
            style={styles.authTextInput}
          />

          <Button mode="contained" onPress={handleSignIn} style={styles.signInButton}>
            Se connecter
          </Button>

          <TouchableOpacity onPress={() => props.navigation.navigate("NewUser")} style={styles.createUserLink}>
            <Text style={styles.createUserText}>Créer un nouvel utilisateur</Text>
          </TouchableOpacity>

          {currentUser && (
            <View style={styles.profileContainer}>
              <Text style={styles.profileTitle}>Utilisateurs connectés :</Text>
              <FlatList
                data={users}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text style={styles.profileItem}>{item.email}</Text>}
              />

              <Text style={styles.profileTitle}>Groupes auxquels vous appartenez :</Text>
              <FlatList
                data={groups}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => props.navigation.navigate("GroupChat", { groupId: item.id })}
                    style={styles.groupItem}
                  >
                    <Text style={styles.profileItem}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />

              <Button mode="contained" onPress={handleSignOut} style={styles.signOutButton}>
                Se déconnecter
              </Button>
            </View>
          )}

          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Text style={styles.buttonText}>Quitter</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}


const styles = StyleSheet.create({
  profileContainer: {
    marginTop: 25,
    alignItems: "center",
    width: "100%",
  },
  profileTitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 10,
  },
  profileItem: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 5,
  },
  groupItem: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 5,
    backgroundColor: "#333",  // Optionnel : pour ajouter du fond sur les éléments de groupe
    padding: 10,
    borderRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#f09",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  statusBar: {
    height: 24,
    width: "100%",
    backgroundColor: "#800040",
  },
  backgroundImage: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: "100%",
    opacity: 0.8,  // Slight opacity for a cleaner look
  },
  authContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 20,
    width: "85%",
    backgroundColor: "#0005", // Transparent dark background for the card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  authText: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 25,
  },
  authTextInput: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  signInButton: {
    marginTop: 20,
    backgroundColor: "#800040",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 5,
  },
  createUserLink: {
    marginTop: 15,
  },
  createUserText: {
    fontWeight: "bold",
    color: "white",
  },
  profileContainer: {
    marginTop: 25,
    alignItems: "center",
    width: "100%",
  },
  profileTitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 10,
  },
  profileItem: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 5,
  },
  signOutButton: {
    marginTop: 25,
    backgroundColor: "#cc0000",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 5,
  },
  exitButton: {
    marginTop: 20,
    backgroundColor: "#cc0000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    width: "60%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
