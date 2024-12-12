import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Authentification from "./screens/Authentification";
import Acceuil from "./screens/Acceuil";
import NewUser from "./screens/NewUser";
import Chat from "./screens/Chat";
import ChaGroup from "./screens/Home/ChatGroup";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Authentification" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Authentification" component={Authentification} />
        <Stack.Screen 
          name="NewUser" 
          component={NewUser} 
          options={{ headerShown: true, title: "Register" }} 
        />
        <Stack.Screen name="Acceuil" component={Acceuil} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="ChatGroup" component={ChaGroup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
