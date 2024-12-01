import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Image,
  Alert,
  Linking,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export default function Chat(props) {
 

  const currentUser = props.route.params?.currentUser;
  const secondUser = props.route.params?.secondUser;

  if (!currentUser || !secondUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Erreur : utilisateurs non définis</Text>
      </View>
    );
  }

  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const db = firebase.database();
  const discussionsRef = db.ref("lesdiscussions");
  const discussionRef = discussionsRef.child(
    currentUser.id > secondUser.id
      ? `${currentUser.id}_${secondUser.id}`
      : `${secondUser.id}_${currentUser.id}`
  );

  const typingRef = db.ref("typing").child(discussionRef.key);

  const handleSend = (type = "text", content) => {
    // Check if the content is empty
    if (!content || content.trim().length === 0) {
      Alert.alert("Erreur", "Vous ne pouvez pas envoyer de message vide.");
      return; // Exit if message is empty
    }
  
    const key = discussionRef.push().key;
    const messageData = {
      body: type === "text" ? content.trim() : content,
      type,
      time: new Date().toISOString(),
      sender: currentUser.id,
      receiver: secondUser.id,
    };
  
    discussionRef.child(key).set(messageData);
    setMessage("");  // Clear the input field
    setIsTyping(false);  // Reset typing indicator
    typingRef.set(false);  // Reset typing status in database
  };
  

  const handleTyping = (text) => {
    setMessage(text);
    setIsTyping(text.length > 0);
    typingRef.set(text.length > 0);
  };

  const handleSendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission d'accès à la localisation refusée.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const locationMessageData = {
      body: `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`,
      time: new Date().toISOString(),
      sender: currentUser.id,
      receiver: secondUser.id,
      type: "location",
    };

    const key = discussionRef.push().key;
    discussionRef.child(key).set(locationMessageData);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.type === "success") {
      console.log("Document selected:", result.uri);  // Log the selected document URI
      handleSend("file", result.uri);
    }
  };
  

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      handleSend("image", result.assets[0].uri);  // Envoi de l'image via l'URI
    }
  };
  

  const renderItem = ({ item, index }) => {
    if (!item) return null;

    const senderUser = item.sender === currentUser.id ? currentUser : secondUser;
    const messageTime = new Date(item.time);

    const formattedTime = `${messageTime.getDate()} ${messageTime.toLocaleString("default", { month: "short" })} ${messageTime.getFullYear()}`;
    const formattedHour = `${messageTime.getHours()}:${messageTime.getMinutes() < 10 ? "0" + messageTime.getMinutes() : messageTime.getMinutes()}`;

    const showDateSeparator = index === 0 || new Date(chatMessages[index - 1].time).toDateString() !== messageTime.toDateString();

    return (
      <View style={styles.messageContainer}>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formattedTime}</Text>
          </View>
        )}
        <Animated.View
          style={[
            item.sender === currentUser.id
              ? styles.currentUserMessageContainer
              : styles.secondUserMessageContainer,
            styles.messageContent,
          ]}
        >
          <View style={styles.messageHeader}>
            <Image source={{ uri: senderUser.image }} style={styles.userImage} />
            <Text style={styles.userName}>{senderUser.nom}</Text>
            <Text style={styles.messageTime}>{formattedHour}</Text>
          </View>
          <Text style={styles.messageText}>
            
  {item.type === "file" ? (
     <View>
     {item.body.endsWith(".pdf") ? (
       <TouchableOpacity onPress={() => Linking.openURL(item.body)}>
         <Text style={{ color: "blue" }}>Ouvrir le PDF</Text>
       </TouchableOpacity>
     ) : (
       <Text style={{ color: "blue" }}>Fichier partagé</Text>
     )}
   </View>
  ) : item.type === "location" ? (
    <Text style={{ color: "blue" }} onPress={() => Linking.openURL(item.body)}>
      Localisation partagée
    </Text>
  ) : item.type === "image" ? (
    <Image source={{ uri: item.body }} style={styles.messageImage} resizeMode="contain" />
  ) : (
    item.body
  )}
</Text>

        </Animated.View>
      </View>
    );
};

  

  useEffect(() => {
    
    const onValueChange = discussionRef.on("value", (snapshot) => {
      const messages = [];
      snapshot.forEach((msgSnapshot) => {
        messages.push(msgSnapshot.val());
      });
      setChatMessages(messages);
      setLoading(false);
    });

    const onTypingChange = typingRef.on("value", (snapshot) => {
      const typingStatus = snapshot.val();
      setOtherUserTyping(typingStatus === true);
    });

    return () => {
      discussionRef.off("value", onValueChange);
      typingRef.off("value", onTypingChange);
    };
  }, [discussionRef, typingRef]);

  return (
    <View style={styles.container}>
      <ImageBackground style={styles.background} source={require("../assets/ciel.jpg")}>
        <StatusBar style="light" backgroundColor="black" />
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Chat avec {secondUser.nom}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ff6347" />
        ) : (
          <FlatList
            data={chatMessages}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.chatContainer}
          />
        )}

        {/* Typing Indicator */}
        {otherUserTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{currentUser.nom} est en train de taper...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tapez un message..."
            placeholderTextColor="#aaa"
            value={message}
            onChangeText={handleTyping}
            multiline={true}
          />
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <MaterialIcons name="photo" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSendLocation}>
            <Ionicons name="location" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSend("text", message)}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  messageImage: {
    width: 200, // Adjust based on desired size
    height: 200, // Adjust based on desired size
    borderRadius: 10, // Optional: adds rounded corners
    marginTop: 10, // Optional: adds margin to space it out
    alignSelf: "center", // Centers the image
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    marginTop: 30, // Lighter neutral background for a softer feel
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    position: 'absolute', // Ensure the background image stays fixed in the background
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: "#1F2A44", // Darker shade for the header, keeping it elegant
    borderBottomWidth: 1,
    borderBottomColor: "#5F6D7E", // Lighter border for a subtle division
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    color: "#F1C40F", // Warm yellow for a welcoming header color
    fontSize: 26, // Increased font size for better readability
    fontWeight: "bold",
    letterSpacing: 1,
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 60, // Adjusted bottom padding to reduce extra space for input area
    paddingTop: 12,
    backgroundColor: "#F4F6F7", // Soft background for chat area
    borderTopLeftRadius: 30, // Rounded corners for the top of the chat area
    borderTopRightRadius: 30,
    overflow: "hidden", // Ensure content doesn't overflow the rounded corners
  },
  messageContainer: {
    padding: 15,
    justifyContent: 'center',
  },
  dateSeparator: {
    marginBottom: 10,
    alignItems: "center",
  },
  dateText: {
    color: "#BDC3C7", // Softer gray for date text
    fontSize: 14, // Increased font size for better readability
    fontStyle: "italic",
  },
  messageContent: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BDC3C7", // Light border to match the date text color
    backgroundColor: "#E4E7E8", // Light gray for the message box
    shadowColor: "#BDC3C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Slightly more prominent shadow for depth
    shadowRadius: 8,
  },
  currentUserMessageContainer: {
    backgroundColor: "#27AE60", // Fresh green for the current user's messages
    alignSelf: "flex-end",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, // Increased shadow for more depth
    shadowRadius: 8,
  },
  secondUserMessageContainer: {
    backgroundColor: "#3498DB", // Calming blue for the second user's messages
    alignSelf: "flex-start",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, // Increased shadow for more depth
    shadowRadius: 8,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF", // Crisp white border for user image
  },
  userName: {
    fontWeight: "bold",
    color: "#FFFFFF", // Clean white for user name text
    fontSize: 16, // Slightly larger font for better readability
    letterSpacing: 0.5,
  },
  messageTime: {
    fontSize: 12,
    color: "#95A5A6", // Subtle gray for the message time
    marginLeft: "auto",
  },
  messageText: {
    color: "#2C3E50", // Dark gray for message content for better readability
    fontSize: 16, // Increased font size for better readability
    lineHeight: 22, // Improved line height for clarity
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#34495E", // Darker background for the input area
    borderTopWidth: 1,
    borderTopColor: "#BDC3C7", // Matching border color
    borderBottomLeftRadius: 30, // Rounded corners for the bottom of the input area
    borderBottomRightRadius: 30,
  },
  input: {
    flex: 1,
    backgroundColor: "#BDC3C7", // Light gray input box for better contrast
    color: "#FFFFFF", // White text for readability
    padding: 12,
    borderRadius: 30,
    fontSize: 16,
    marginRight: 12,
    lineHeight: 20,
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    padding: 10,
    backgroundColor: "#7F8C8D", // Soft gray for icon buttons
    borderRadius: 20,
    elevation: 3, // Slightly increased elevation for better depth
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
    backgroundColor: "#2ECC71", // Fresh green for send button
    borderRadius: 30,
    padding: 12,
    elevation: 4, // Subtle elevation for the send button
  },
  typingIndicator: {
    padding: 12,
    backgroundColor: "#34495E", // Dark background for typing indicator
  },
  typingText: {
    color: "#F1C40F", // Bright yellow for typing indicator text
    fontSize: 14,
    fontWeight: "bold", // Make the text bold for better emphasis
  },
});
