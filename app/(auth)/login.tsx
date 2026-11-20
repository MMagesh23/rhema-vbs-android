import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth/AuthProvider";

export default function LoginScreen() {
  const { login, user, isLoading } = useAuth();
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user?.role === "teacher") return <Redirect href="/(teacher)" />;

  const onLogin = async () => {
    if (!userID.trim() || !password) return Alert.alert("Missing details", "Enter your teacher ID and password.");
    setSubmitting(true);
    try { await login(userID.trim(), password); }
    catch (error) { Alert.alert("Login failed", error instanceof Error ? error.message : "Please try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.brand}><Text style={styles.brandMark}>R</Text><Text style={styles.brandName}>RHEMA VBS</Text><Text style={styles.subtitle}>TEACHER PORTAL</Text></View>
      <View style={styles.card}>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.helper}>Sign in with the teacher account provided by your VBS administrator.</Text>
        <Text style={styles.label}>Teacher ID</Text>
        <TextInput value={userID} onChangeText={setUserID} autoCapitalize="none" autoCorrect={false} placeholder="Enter teacher ID" style={styles.input} returnKeyType="next" />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Enter password" style={styles.input} onSubmitEditing={onLogin} />
        <Pressable style={[styles.button, submitting && styles.disabled]} onPress={onLogin} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
        <Text style={styles.note}>Teacher accounts only. Contact your administrator if you need access.</Text>
      </View>
      <Text style={styles.footer}>Presence of Jesus Ministry</Text>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#F4F6FA",justifyContent:"center",padding:24},
  brand:{alignItems:"center",marginBottom:28},brandMark:{width:54,height:54,textAlign:"center",textAlignVertical:"center",overflow:"hidden",borderRadius:16,backgroundColor:"#0F172A",color:"#FFFFFF",fontSize:30,fontWeight:"800"},
  brandName:{fontSize:24,fontWeight:"800",letterSpacing:2,color:"#0F172A",marginTop:12},subtitle:{fontSize:10,letterSpacing:3,color:"#64748B",marginTop:5},
  card:{backgroundColor:"#FFFFFF",padding:24,borderRadius:22,borderWidth:1,borderColor:"#E7EAF0"},
  heading:{fontSize:23,fontWeight:"700",color:"#111827"},helper:{fontSize:13,lineHeight:20,color:"#64748B",marginTop:8,marginBottom:24},
  label:{fontSize:12,fontWeight:"700",color:"#334155",marginBottom:8,marginTop:12},input:{height:50,borderWidth:1,borderColor:"#DCE2EA",borderRadius:12,paddingHorizontal:14,fontSize:15,color:"#0F172A",backgroundColor:"#FFFFFF"},
  button:{height:52,backgroundColor:"#2563EB",borderRadius:12,alignItems:"center",justifyContent:"center",marginTop:24},disabled:{opacity:.65},buttonText:{color:"#FFFFFF",fontSize:15,fontWeight:"700"},
  note:{fontSize:11,lineHeight:17,color:"#94A3B8",textAlign:"center",marginTop:18},footer:{textAlign:"center",color:"#94A3B8",fontSize:11,marginTop:26}
});