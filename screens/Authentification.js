import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, BackHandler, Alert, FlatList } from "react-native";
import { Button, TextInput } from "react-native-paper";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

export default function Authentification(props) {
  const [email, setEmail] = useState("Ameni@gmail.com");
  const [pwd, setPwd] = useState("1234567");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const refInput2 = useRef();
  const auth = firebase.auth();

  useEffect(() => {
    // Observer l'état de l'authentification
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchUsers(); // Charger les profils
      } else {
        setCurrentUser(null);
        setUsers([]); // Réinitialiser la liste des utilisateurs quand il n'y a pas de connexion
      }
    });

    return () => unsubscribe(); // Nettoyer l'observation
  }, []);

  // Quitter l'application
  const handleExit = () => {
    BackHandler.exitApp();
  };

  // Connexion avec email et mot de passe
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

  // Déconnexion
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

  // Charger les utilisateurs
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.statusBar} />
      <ImageBackground source={require("../assets/image.png")} style={styles.backgroundImage}>
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

          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.signInButton}
          >
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
                renderItem={({ item }) => (
                  <Text style={styles.profileItem}>{item.email}</Text>
                )}
              />
              <Button
                mode="contained"
                onPress={handleSignOut}
                style={styles.signOutButton}
              >
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
  },
  authContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 20,
    width: "85%",
    backgroundColor: "#0005",
  },
  authText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  authTextInput: {
    width: "100%",
    marginBottom: 15,
  },
  signInButton: {
    marginTop: 10,
    backgroundColor: "#800040",
  },
  createUserLink: {
    marginTop: 15,
  },
  createUserText: {
    fontWeight: "bold",
    color: "white",
  },
  profileContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  profileTitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
  },
  profileItem: {
    fontSize: 16,
    color: "white",
  },
  signOutButton: {
    marginTop: 20,
    backgroundColor: "#cc0000",
  },
  exitButton: {
    marginTop: 15,
    backgroundColor: "#cc0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
