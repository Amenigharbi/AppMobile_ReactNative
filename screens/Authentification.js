import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import {useState,useRef} from 'react';

export default function Authentification() {
  const [email,setemail]=useState("Ameni@gmail.com")
  const [pwd, setpwd] = useState("123")
  const refinput2=useRef();
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.statusBar} />
      <ImageBackground source={require('../assets/image.png')} style={styles.backgroundImage}>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Authentification</Text>
          
          <TextInput
            onChangeText={(text)=>{setemail(text)}}
            onSubmitEditing={()=>{refinput2.current.focus();}}
            blurOnSubmit={false}
            keyboardType="email-address"
            placeholder="Email"
            style={styles.authTextInput}
          />
          
          <TextInput
            ref={refinput2}
            onChangeText={(text)=>{setpwd(text)}}
            keyboardType="default"
            placeholder="Password"
            secureTextEntry={true}
            style={styles.authTextInput}
          />
          
          <TouchableOpacity style={styles.signInButton}
           onPress={()=>{
            if(email==="Ameni@gmail.com" && (pwd==="123")){
                  alert("Welcome!")
            }else alert("error!");
           }}>
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
           onPress={()=>{alert("Welcome!")}}>
            <Text style={{ fontWeight: "bold", color: "white" }}>Create new user</Text>
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
    height: 300,
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
