import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";

export default function Index() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#2563EB" /></View>;
  return <Redirect href={user?.role === "teacher" ? "/(teacher)" : "/(auth)/login"} />;
}