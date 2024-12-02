import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  Alert,
  View,
} from "react-native";
import firebase from "../../Config";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../Config";

const database = firebase.database();

export default function MyProfil({ route }) {
  const currentid = route?.params?.currentid;
  const [nom, setNom] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [telephone, setTelephone] = useState("");
  const [uri_local_img, seturi_local_img] = useState("");

  useEffect(() => {
    const ref = database.ref("lesprofiles/unprofil" + currentid);
    ref.once("value", (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setNom(data.nom || "");
        setPseudo(data.pseudo || "");
        setTelephone(data.telephone || "");
        seturi_local_img(data.image || "");
      }
    });
  }, [currentid]);

  const uploadtoSupa = async () => {
    try {
      const response = await fetch(uri_local_img);
      const blob = await response.blob();
      const arraybuffer = await new Response(blob).arrayBuffer();

      const { data, error } = await supabase.storage
        .from("ProfileImages")
        .upload(`${currentid}.jpg`, arraybuffer, { upsert: true });

      if (error) {
        throw error;
      }

      const { publicURL, error: urlError } = supabase.storage
        .from("ProfileImages")
        .getPublicUrl(`${currentid}.jpg`);

      if (urlError) {
        throw urlError;
      }

      return publicURL;
    } catch (error) {
      Alert.alert("Error", "Image upload failed.");
      console.error(error);
      return null;
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Permission to access the gallery is required.");
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Error", "Permission to access the camera is required.");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        seturi_local_img(result.assets[0].uri);
      } else {
        console.log("User canceled the image picker.");
      }
    } catch (error) {
      console.error("ImagePicker error:", error);
      Alert.alert("Error", "Image selection failed.");
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        seturi_local_img(result.assets[0].uri);
      } else {
        console.log("User canceled the camera.");
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Photo capture failed.");
    }
  };

  const handleSave = async () => {
    if (!nom || !pseudo || !telephone) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    const imageLink = await uploadtoSupa();
    if (!imageLink) return;

    const ref_unprofil = database.ref("lesprofiles/unprofil" + currentid);
    ref_unprofil
      .set({
        id: currentid,
        nom,
        pseudo,
        telephone,
        image: imageLink,
      })
      .then(() => {
        Alert.alert("Success", "Profile saved successfully.");
        setNom("");
        setPseudo("");
        setTelephone("");
        seturi_local_img(""); // Reset image
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
        console.error("Error saving profile:", error);
      });
  };

  return (
    <ImageBackground
      source={require("../../assets/imm.jpg")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Text style={styles.textHeader}>My Account</Text>
      <View style={styles.imageContainer}>
        <TouchableHighlight onPress={pickImage}>
          <Image
            source={
              uri_local_img
                ? { uri: uri_local_img }
                : require("../../assets/3135823.png")
            }
            style={styles.profileImage}
          />
        </TouchableHighlight>
        <TouchableHighlight onPress={takePhoto}>
          <Text style={styles.cameraButton}>Take Photo</Text>
        </TouchableHighlight>
      </View>

      <TextInput
        value={nom}
        onChangeText={setNom}
        placeholder="Nom"
        style={styles.textInput}
      />
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="Pseudo"
        style={styles.textInput}
      />
      <TextInput
        value={telephone}
        onChangeText={setTelephone}
        placeholder="Numero"
        keyboardType="phone-pad"
        style={styles.textInput}
      />

      <TouchableHighlight
        onPress={handleSave}
        style={styles.saveButton}
        activeOpacity={0.7}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableHighlight>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 20,
    marginTop: 30,  // Add space at the top of the screen
  },
  textHeader: {
    fontSize: 28,
    color: "#fff", // White text color
    fontWeight: "bold",
    marginBottom: 12,
    backgroundColor: "#09f", // Button-like background color
    paddingVertical: 10, // Add vertical padding for the button-like effect
    paddingHorizontal: 20, // Add horizontal padding for the button-like effect
    borderRadius: 20, // Rounded corners to make it look like a button
    textAlign: "center", // Center the text inside the "button"
  },
  
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  profileImage: {
    borderRadius: 100,
    height: 180,
    width: 180,
    marginBottom: 10,
    borderWidth: 5,
    borderColor: "#07f",
    backgroundColor: "#fff",
  },
  cameraButton: {
    color: "#fff",
    backgroundColor: "#08f6",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    fontSize: 16,
  },
  textInput: {
    backgroundColor: "#fff4",
    color: "#fff",
    width: "80%",
    height: 50,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 18,
    paddingHorizontal: 15,
  },
  saveButton: {
    backgroundColor: "#000", // Change the background color to black
    borderRadius: 8,
    height: 50,
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
   
    borderWidth: 2,
    borderColor: "#fff",
  },
  saveButtonText: {
    fontSize: 20,
    color: "#fff",
  },
});
