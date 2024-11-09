import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useState, useRef } from 'react';
import firebase from '../Config';
const auth = firebase.auth();

export default function NewUser({ navigation }) {  
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState(""); 
  const refInputPwd = useRef();
  const refInputConfirmPwd = useRef();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.statusBar} />
      <ImageBackground source={require('../assets/image.png')} style={styles.backgroundImage}>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>New User</Text>

          <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
            onSubmitEditing={() => refInputPwd.current.focus()}
            blurOnSubmit={false}
            keyboardType="email-address"
            placeholder="Email"
            style={styles.authTextInput}
          />

          <TextInput
            ref={refInputPwd}
            value={pwd}
            onChangeText={(text) => setPwd(text)}
            onSubmitEditing={() => refInputConfirmPwd.current.focus()}
            blurOnSubmit={false}
            keyboardType="default"
            placeholder="Password"
            secureTextEntry={true}
            style={styles.authTextInput}
          />

          <TextInput
            ref={refInputConfirmPwd}
            value={confirmPwd}
            onChangeText={(text) => setConfirmPwd(text)}
            keyboardType="default"
            placeholder="Confirm Password"
            secureTextEntry={true}
            style={styles.authTextInput}
          />

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => {
              if (pwd === confirmPwd) {
                auth.createUserWithEmailAndPassword(email, pwd)
                  .then(() => {
                    navigation.replace("Acceuil");
                  })
                  .catch((err) => {
                    alert(err.message);
                  });
              } else {
                alert("Passwords do not match!");
              }
            }}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f09',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statusBar: {
    height: 24,
    width: '100%',
    backgroundColor: '#800040',
  },
  backgroundImage: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  authContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    height: 400,
    width: '85%',
    backgroundColor: '#0005',
  },
  authText: {
    marginTop: 15,
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  authTextInput: {
    fontFamily: "serif",
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
    padding: 5,
    height: 60,
    width: '90%',
    borderRadius: 5,
    textAlign: 'center',
  },
  signInButton: {
    marginTop: 15,
    backgroundColor: '#800040',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButton: {
    marginTop: 15,
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
