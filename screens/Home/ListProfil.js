import React, { useState, useEffect } from "react";
import {
  SectionList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import firebase from "../../Config"; 
import { Ionicons } from '@expo/vector-icons'; // Importer Ionicons

const database = firebase.database();

export default function ListProfil({ route, navigation }) {
  const { currentid } = route.params || {}; // Get current user ID from route params
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentid) {
      Alert.alert("Erreur", "L'ID de l'utilisateur actuel est manquant.");
      return;
    }
  
    const statusRef = database.ref(`status/${currentid}`);
    statusRef.set({ online: true });
    statusRef.onDisconnect().set({ online: false });
  
    const refProfiles = database.ref("lesprofiles");
    refProfiles.on("value", (snapshot) => {
      let usersList = [];
      snapshot.forEach((child) => {
        const profile = child.val();
        usersList.push(profile);
      });
  
      const statusRef = database.ref("status");
      statusRef.once("value", (statusSnapshot) => {
        const onlineUsers = [];
        const offlineUsers = [];
  
        usersList.forEach((user) => {
          const userStatus = statusSnapshot.child(user.id).val();
          if (userStatus?.online) {
            onlineUsers.push(user);
          } else {
            offlineUsers.push(user);
          }
        });
  
        const groupedUsers = [
          {
            title: "Autres utilisateurs",
            data: offlineUsers.filter((user) => user.id !== currentid),
          },
          {
            title: "Utilisateurs connectés",
            data: onlineUsers,
          },
        ];
  
        setSections(groupedUsers);
        setLoading(false);
      });
    });
  
    return () => {
      refProfiles.off("value");
      statusRef.off();
    };
  }, [currentid]);

  const handlePressProfile = (user) => {
    const currentUser = sections
      .flatMap((section) => section.data)
      .find((u) => u.id === currentid); // Obtenir l'utilisateur actuel
  
    navigation.navigate("Chat", {
      currentUser, // Utilisateur actuel
      secondUser: user, // Utilisateur sélectionné
    });
  
    console.log("Utilisateur actuel:", currentUser);
    console.log("Utilisateur sélectionné:", user);
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

  const renderUser = ({ item }) => {
    const isOnline = sections.find(section => section.title === "Utilisateurs connectés")?.data.includes(item);
  
    return (
      <TouchableOpacity
        onPress={() => handlePressProfile(item)}
        style={styles.profileCard}
        key={item.id}
      >
        <Image
          source={item.image ? { uri: item.image } : require("../../assets/fond.jpg")}
          style={styles.profileImage}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{item.pseudo}</Text>
          <Text style={styles.profileInfo}>{item.nom}</Text>
          <Text style={styles.profileInfo}>{item.telephone}</Text>
        </View>
        <View
          style={[styles.statusDot, { backgroundColor: isOnline ? "green" : "red" }]}
        />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <ImageBackground
      source={require("../../assets/back.jpg")}
      style={styles.container}
    >

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderUser}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Remplacer le bouton de déconnexion par une icône */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={30} color="white" />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  title: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
    marginVertical: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E67E22",
    marginVertical: 10,
    textAlign: "left",
    alignSelf: "stretch",
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  profileDetails: {
    marginLeft: 15,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: 10,
  },
  logoutButton: {
    position: 'absolute', // Permet de le positionner précisément
    top: 40, // Distance du haut
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
