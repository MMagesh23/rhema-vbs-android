import { Link, Redirect } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useAuth } from "@/features/auth/AuthProvider";

function ActionCard({title,description,href}:{title:string;description:string;href:"/(teacher)/students"|" /(teacher)/attendance"}) {
  return <Link href={href.trim() as "/(teacher)/students" | "/(teacher)/attendance"} asChild><Pressable style={styles.action}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionDescription}>{description}</Text><Text style={styles.arrow}>Open →</Text></Pressable></Link>;
}
export default function TeacherDashboard() {
  const {user,logout} = useAuth();
  if (!user || user.role !== "teacher") return <Redirect href="/(auth)/login" />;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.hero}><Text style={styles.eyebrow}>TEACHER WORKSPACE</Text><Text style={styles.greeting}>Hello, {user.name || "Teacher"}</Text><Text style={styles.heroText}>Your VBS class tools, in one place.</Text></View>
    <Text style={styles.section}>Quick access</Text>
    <ActionCard title="My Students" description="View students assigned to your class." href="/(teacher)/students" />
    <ActionCard title="Student Attendance" description="Check the attendance window and view or submit attendance." href="/(teacher)/attendance" />
    <View style={styles.profile}><Text style={styles.profileLabel}>SIGNED IN AS</Text><Text style={styles.profileName}>{user.name}</Text><Text style={styles.profileMeta}>Teacher ID: {user.userID}</Text><Text style={styles.profileMeta}>{user.email || "Teacher account"}</Text></View>
    {user.mustChangePassword ? <Text style={styles.warning}>Your account requires a password change. Please contact your administrator to complete this securely.</Text> : null}
    <Pressable style={styles.logout} onPress={()=>logout()}><Text style={styles.logoutText}>Sign out</Text></Pressable>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#F4F6FA"},content:{padding:20,paddingBottom:40},hero:{backgroundColor:"#0F172A",padding:24,borderRadius:22,marginBottom:28},eyebrow:{fontSize:10,letterSpacing:2,color:"#93C5FD",fontWeight:"700"},greeting:{fontSize:27,fontWeight:"800",color:"#FFFFFF",marginTop:14},heroText:{fontSize:13,color:"#CBD5E1",marginTop:7},section:{fontSize:17,fontWeight:"800",color:"#0F172A",marginBottom:14},action:{backgroundColor:"#FFFFFF",padding:20,borderRadius:18,borderWidth:1,borderColor:"#E5EAF1",marginBottom:12},actionTitle:{fontSize:16,fontWeight:"700",color:"#0F172A"},actionDescription:{fontSize:12,color:"#64748B",marginTop:6,lineHeight:18},arrow:{fontSize:12,color:"#2563EB",fontWeight:"700",marginTop:14},profile:{padding:18,backgroundColor:"#FFFFFF",borderRadius:16,marginTop:12},profileLabel:{fontSize:9,letterSpacing:1.5,color:"#94A3B8",fontWeight:"700"},profileName:{fontSize:16,fontWeight:"700",color:"#0F172A",marginTop:8},profileMeta:{fontSize:12,color:"#64748B",marginTop:5},warning:{color:"#92400E",backgroundColor:"#FEF3C7",padding:12,borderRadius:12,marginTop:12,fontSize:12,lineHeight:18},logout:{marginTop:18,padding:14,alignItems:"center"},logoutText:{color:"#DC2626",fontWeight:"700"}});