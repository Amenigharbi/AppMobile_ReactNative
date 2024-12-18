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
import firebase from "../Config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
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
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false); // Etat pour vérifier si l'utilisateur actuel tape
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
    if (!content || content.trim().length === 0) {
      Alert.alert("Erreur", "Vous ne pouvez pas envoyer de message vide.");
      return; 
    }
  
    const key = discussionRef.push().key;
    const messageData = {
      body: type === "text" ? content.trim() : content,
      type,
      time: new Date().toISOString(),
      sender: currentUser.id,
      receiver: secondUser.id,
      isRead: false, // Messages marqués comme non lus
    };
  
    discussionRef.child(key).set(messageData);
    setMessage("");
    setIsCurrentUserTyping(false); // Quand un message est envoyé, l'utilisateur actuel n'est plus en train de taper
    typingRef.set(false); // Effacer l'indicateur de saisie
  };

  const handleTyping = (text) => {
    setMessage(text);
    setIsCurrentUserTyping(text.length > 0); // Utilisateur actuel tape
    setIsTyping(text.length > 0); // Indicateur de saisie
    typingRef.set(text.length > 0); // Informer Firebase que l'utilisateur tape
  };

  const handleCall = () => {
    if (!secondUser || !secondUser.telephone) {
      Alert.alert("Erreur", "Numéro de téléphone indisponible.");
      return;
    }
    const phoneNumber = `tel:${secondUser.telephone}`;
    Linking.openURL(phoneNumber).catch((err) =>
      Alert.alert("Erreur", "Impossible d'ouvrir le composeur téléphonique.")
    );
  };

  const handleSendLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission refusée. Impossible d'envoyer la localisation.");
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
      await discussionRef.child(key).set(locationMessageData);
    } catch (error) {
      alert("Erreur lors de l'envoi de la localisation : " + error.message);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      handleSend("image", result.assets[0].uri);  
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
            {item.type === "location" ? (
              <Text style={{ color: "blue" }} onPress={() => Linking.openURL(item.body)}>
                Localisation partagée
              </Text>
            ) : item.type === "image" ? (
              <Image source={{ uri: item.body }} style={styles.messageImage} resizeMode="contain" />
            ) : (
              item.body
            )}
          </Text>
          <Text style={styles.messageStatus}>
            {item.isRead ? "Vu" : "Non lu"}
          </Text>
        </Animated.View>
      </View>
    );
  };

  useEffect(() => {
    const onValueChange = discussionRef.on("value", (snapshot) => {
      const messages = [];
      snapshot.forEach((msgSnapshot) => {
        const message = msgSnapshot.val();
        messages.push(message);

        if (message.receiver === currentUser.id && !message.isRead) {
          discussionRef.child(msgSnapshot.key).update({ isRead: true });
        }
      });
      setChatMessages(messages);
      setLoading(false);
    });

    return () => {
      discussionRef.off("value");
    };
  }, [discussionRef, currentUser.id]);

  return (
    <View style={styles.container}>
      <ImageBackground style={styles.background} source={require("../assets/ciel.jpg")}>
        <StatusBar barStyle="light" />
        <View style={styles.headerContainer}>
          <Text style={styles.header}>{secondUser.nom}</Text>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
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

        {otherUserTyping && !isCurrentUserTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{secondUser.nom} est en train de taper...</Text>
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
  messageContainer: {
    padding: 15,
    justifyContent: 'center',
  },
  messageStatus: {
    fontSize: 12,
    color: "#95A5A6", // Couleur gris pour le texte de statut
    marginTop: 5,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#B8A68D", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: 50,
  },
  callButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: '#28A745', // Green color for call
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  header: {
    color: "#E67E22", 
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 60,
    paddingTop: 12,
    backgroundColor: "#BDC3C7", 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
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
    color: "#7F8C8D", 
    fontSize: 14,
    fontStyle: "italic",
  },
  messageContent: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BDC3C7", 
    backgroundColor: "#D5DBDB", 
    shadowColor: "#BDC3C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  currentUserMessageContainer: {
    backgroundColor: "#E67E22", 
    alignSelf: "flex-end",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  secondUserMessageContainer: {
    backgroundColor: "#fff", 
    alignSelf: "flex-start",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
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
    borderColor: "#FFFFFF", 
  },
  userName: {
    fontWeight: "bold",
    color: "#FFFFFF", 
    fontSize: 16,
    letterSpacing: 0.5,
  },
  messageTime: {
    fontSize: 12,
    color: "#95A5A6", 
    marginLeft: "auto",
  },
  messageText: {
    color: "#2C3E50", 
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff", 
    borderTopWidth: 1,
    borderTopColor: "#BDC3C7", 
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  input: {
    flex: 1,
    backgroundColor: "#BDC3C7", 
    color: "#FFFFFF", 
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
    backgroundColor: "#7F8C8D", 
    borderRadius: 20,
    elevation: 3,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
    backgroundColor: "#E67E22", 
    borderRadius: 30,
    padding: 12,
    elevation: 4,
  },
  typingIndicator: {
    padding: 12,
    backgroundColor: "#8E7C4B",
  },
  typingText: {
    color: "#E67E22", 
    fontSize: 14,
    fontWeight: "bold",
  },
});
