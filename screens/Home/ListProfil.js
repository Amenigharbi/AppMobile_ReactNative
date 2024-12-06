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

    const refProfiles = database.ref("lesprofiles");
    refProfiles.once("value", (snapshot) => {
      let usersList = [];
      snapshot.forEach((child) => {
        const profile = child.val();
        usersList.push(profile);
      });

      // Group users into sections
      const groupedUsers = [
        {
          title: "Autres utilisateurs",
          data: usersList.filter((user) => user.id !== currentid),
        },
        {
          title: "Utilisateur connecté",
          data: usersList.filter((user) => user.id === currentid),
        },
      ];

      setSections(groupedUsers);
      setLoading(false);
    });

    return () => refProfiles.off("value");
  }, [currentid]);

  const handlePressProfile = (user) => {
    const currentUser = sections
      .find((section) => section.title === "Utilisateur connecté")
      ?.data?.[0];
    navigation.navigate("Chat", {
      currentUser,
      secondUser: user,
    });
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
    // Define online/offline status (this can be dynamically set based on user activity)
    const isOnline = item.id === currentid ? true : false;  // Example logic

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
      <Text style={styles.title}>Commencer à chatter avec</Text>

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

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
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
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: "#E67E22", 
    borderRadius: 30,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
