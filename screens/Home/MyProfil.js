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
    const ref = database.ref("lesprofiles").child("unprofil" + currentid);
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

      // Upload image to Supabase storage
      const { data, error } = await supabase.storage
        .from("ProfileImages")
        .upload($`{currentid}`.jpg, arraybuffer, { upsert: true });

      if (error) {
        throw error;
      }

      // Get public URL for the uploaded file
      const { publicURL, error: urlError } = supabase.storage
        .from("ProfileImages")
        .getPublicUrl($`{currentid}`.jpg);

      if (urlError) {
        throw urlError;
      }

      return publicURL; // Return the public URL of the uploaded image
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

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;
  
      const action = await Alert.alert(
        "Select Image",
        "Do you want to take a photo or pick from the gallery?",
        [
          {
            text: "Camera",
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });
  
              if (!result.canceled) {
                seturi_local_img(result.assets[0].uri);
              } else {
                console.log("User canceled the image picker.");
              }
            },
          },
          {
            text: "Gallery",
            onPress: async () => {
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
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("ImagePicker error:", error);
      Alert.alert("Error", "Image selection failed.");
    }
  };

  const handleSave = async () => {
    console.log('Save button clicked'); 
    if (!nom || !pseudo || !telephone) {
      Alert.alert("Missing Fields", "Please fill out all fields before saving.");
      console.log("Fields missing"); // If the fields are empty
      return;
    }
  
    const imageLink = await uploadtoSupa();
    if (!imageLink) {
      console.log("Image upload failed");
      return;
    }
  
    console.log("Image URL:", imageLink); // Check if the image URL is correct
  
    const ref_unprofil = database.ref("lesprofiles").child("unprofil" + currentid);
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
        console.log("Profile saved successfully");
        setNom("");
        setPseudo("");
        setTelephone("");
        seturi_local_img("../../assets/3135823.png"); 
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
  onPress={() => {
    // Check if any required field is empty
    if (!nom || !pseudo || !telephone) {
      Alert.alert("Missing Fields", "Please fill out all fields before saving.");
      return;  // Exit the function if fields are missing
    }

    // Proceed to save the profile if all fields are filled
    const ref_unprofil = database.ref("lesprofiles/unprofil" + currentid);
    ref_unprofil
      .set({
        id: currentid,
        nom,
        pseudo,
        telephone,
        image: uri_local_img || "http://dummyimage.com/600x400/000/fff",  // Use default image if no image selected
      })
      .then(() => {
        Alert.alert("Success", "Profile saved successfully.");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  }}
  activeOpacity={0.5}
  underlayColor="#DDDDDD"
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
    alignItems: "center",
    justifyContent: "center",
  },
  textHeader: {
    fontSize: 30,
    color: "#07f",
    fontWeight: "bold",
    marginBottom: 20,
  },
  profileImage: {
    borderRadius: 100,
    height: 200,
    width: 200,
    marginBottom: 20,
  },
  textInput: {
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
    borderColor: "#00f",
    borderWidth: 2,
    backgroundColor: "#08f6",
    height: 40,
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