import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useState, useRef } from 'react';
import firebase from '../Config';

const auth = firebase.auth();

export default function NewUser({ navigation }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const refInputPwd = useRef();
  const refInputConfirmPwd = useRef();

  const handleRegister = () => {
    if (!email || !pwd || !confirmPwd) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    if (pwd !== confirmPwd) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    auth
      .createUserWithEmailAndPassword(email, pwd)
      .then(() => {
        const currentid = auth.currentUser.uid;
        navigation.replace('Acceuil', { currentid });
      })
      .catch((err) => alert(err.message));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground source={require('../assets/image.png')} style={styles.backgroundImage}>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Nouvel Utilisateur</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={() => refInputPwd.current.focus()}
            blurOnSubmit={false}
            keyboardType="email-address"
            placeholder="Email"
            style={styles.authTextInput}
          />
          <TextInput
            ref={refInputPwd}
            value={pwd}
            onChangeText={setPwd}
            onSubmitEditing={() => refInputConfirmPwd.current.focus()}
            blurOnSubmit={false}
            placeholder="Mot de passe"
            secureTextEntry
            style={styles.authTextInput}
          />
          <TextInput
            ref={refInputConfirmPwd}
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
            style={styles.authTextInput}
          />
          <TouchableOpacity style={styles.signInButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>S'inscrire</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backgroundImage: { flex: 1, justifyContent: 'center', width: '100%' },
  authContainer: { alignItems: 'center', backgroundColor: '#0005', borderRadius: 8, width: '85%', padding: 20 },
  authText: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  authTextInput: { height: 50, width: '90%', marginBottom: 15, borderBottomWidth: 1, textAlign: 'center' },
  signInButton: { backgroundColor: '#800040', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  backButton: { backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
