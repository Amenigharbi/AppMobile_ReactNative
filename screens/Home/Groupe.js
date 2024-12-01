import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Groupe() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Voici le contenu de l'onglet Groupe</Text>
    </View>
  );
}
/*creation de compte premiere fois, donner nom, image pseudo , telephone obligatoire lazem 
list des profiles afficher les profiles connectés , fil authenti ytala3ha mil authentification ,service de connexion et decon
ajouter service istyping 
fil chat afficher les images de chaque utilisateur date mta3 chat
badel il design , ajouter position gps w nab3atheha fil discussion , possibilité envoye fichier 
fil profile ynajem mil camera ye5ou taswira 
section list yaffichi ama maghir gifted chat 
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
