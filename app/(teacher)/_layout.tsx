import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";
export default function TeacherLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <View style={{ flex:1,alignItems:"center",justifyContent:"center" }}><ActivityIndicator color="#2563EB" size="large" /></View>;
  if (!user || user.role !== "teacher") return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerStyle:{backgroundColor:"#FFFFFF"},headerTintColor:"#0F172A",headerTitleStyle:{fontWeight:"700"} }}>
    <Stack.Screen name="index" options={{title:"RHEMA VBS"}} />
    <Stack.Screen name="students" options={{title:"My Students"}} />
    <Stack.Screen name="attendance" options={{title:"Attendance"}} />
    <Stack.Screen name="profile" options={{title:"My Profile"}} />
  </Stack>;
}