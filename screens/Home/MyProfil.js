import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  Alert,
} from "react-native";
import firebase from "../../Config";

const database = firebase.database();

export default function MyProfils() {
  const [nom, setNom] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [telephone, setTelephone] = useState("");

  const handleSave = () => {
    if (!nom || !pseudo || !telephone) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    const ref_lesprofiles = database.ref("lesprofiles");
    const key = ref_lesprofiles.push().key;
    ref_lesprofiles
      .child(key)
      .set({
        nom,
        pseudo,
        telephone,
      })
      .then(() => {
        Alert.alert("Success", "Profile saved successfully.");
        setNom("");
        setPseudo("");
        setTelephone("");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <ImageBackground
      source={require("../../assets/hhh.jpg")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Text style={styles.textHeader}>My Account</Text>

      <Image
        source={require("../../assets/3135823.png")}
        style={styles.profileImage}
      />

      <TextInput
        value={nom}
        onChangeText={setNom}
        textAlign="center"
        placeholderTextColor="#fff"
        placeholder="Nom"
        keyboardType="default"
        style={styles.textInput}
      />
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        textAlign="center"
        placeholderTextColor="#fff"
        placeholder="Pseudo"
        keyboardType="default"
        style={styles.textInput}
      />
      <TextInput
        value={telephone}
        onChangeText={setTelephone}
        placeholderTextColor="#fff"
        textAlign="center"
        placeholder="Numero"
        keyboardType="phone-pad"
        style={styles.textInput}
      />

      <TouchableHighlight
        onPress={handleSave}
        activeOpacity={0.7}
        underlayColor="#0055DD"
        style={styles.saveButton}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableHighlight>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textHeader: {
    fontSize: 40,
    fontFamily: "serif",
    color: "#07f",
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileImage: {
    height: 200,
    width: 200,
    marginBottom: 20,
  },
  textInput: {
    fontWeight: "bold",
    backgroundColor: "#0004",
    fontSize: 20,
    color: "#fff",
    width: "75%",
    height: 50,
    borderRadius: 10,
    margin: 5,
    paddingHorizontal: 10,
  },
  saveButton: {
    marginBottom: 10,
    borderColor: "#00f",
    borderWidth: 2,
    backgroundColor: "#08f6",
    height: 60,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 24,
  },
});
