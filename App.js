import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Authentification from "./screens/Authentification";
import { NavigationContainer } from "@react-navigation/native";
import Acceuil from "./screens/Acceuil";
import NewUser from "./screens/NewUser";
const Stack=createNativeStackNavigator();
export default function App() {
 return <NavigationContainer>
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="Authentification" component={Authentification} />
      <Stack.Screen name="NewUser" component={NewUser} options={{headerShown:true}}></Stack.Screen>
      <Stack.Screen name="Acceuil" component={Acceuil}></Stack.Screen>

    </Stack.Navigator>
 </NavigationContainer>
}