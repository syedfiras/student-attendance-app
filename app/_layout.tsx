import { Stack } from "expo-router";
import "../global.css"
import { HeaderShownContext } from "@react-navigation/elements";
export default function RootLayout() {
  return <Stack 
   screenOptions={{
        headerShown: false,
   }}
  />;
}
