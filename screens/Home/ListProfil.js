import React, { useState, useEffect } from "react";
import {
  FlatList,
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
  const { currentid } = route.params || {}; 
  const [users, setUsers] = useState([]);
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
      setUsers(usersList);
      setLoading(false);
    });

    return () => refProfiles.off("value");
  }, [currentid]);

  const handlePressProfile = (user) => {
    const currentUser = users.find((u) => u.id === currentid);
    navigation.navigate("Chat", {
      currentUser,
      secondUser: user,
    });
  };

  const renderUser = ({ item }) => {
    const isCurrentUser = item.id === currentid;
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
          <Text style={styles.profileName}>
            {item.pseudo} {isCurrentUser ? "(Utilisateur connecté)" : "(Non connecté)"}
          </Text>
          <Text style={styles.profileInfo}>{item.nom}</Text>
          <Text style={styles.profileInfo}>{item.telephone}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/fond.jpg")}
      style={styles.container}
    >
      <Text style={styles.title}>Commencer à chatter avec</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000",
    justifyContent: "flex-start", // Aligner le contenu en haut de l'écran
    paddingTop: 40, // Ajouter un espace en haut
  },
  title: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
    marginVertical: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    textAlign: "center", // Centrer le titre
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
});
