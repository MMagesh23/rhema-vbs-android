import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiRequest } from "@/services/api";
type WindowStatus={allowed?:boolean;message?:string;startTime?:string;endTime?:string};
type WindowResponse={success:boolean;data:WindowStatus};
export default function AttendanceScreen() {
  const query=useQuery({queryKey:["attendance-window"],queryFn:()=>apiRequest<WindowResponse>("/attendance/window-status"),refetchInterval:60_000});
  const status=query.data?.data;
  return <ScrollView style={styles.screen} contentContainerStyle={{padding:20}}>
    <Text style={styles.heading}>Student Attendance</Text>
    <Text style={styles.sub}>Attendance availability follows the active VBS schedule and server-side time window.</Text>
    <View style={styles.card}><Text style={styles.label}>TODAY'S SUBMISSION WINDOW</Text>
      {query.isLoading?<ActivityIndicator color="#2563EB" style={{marginTop:18}}/>:query.isError?<Text style={styles.message}>Unable to check attendance availability. Please try again.</Text>:
        <><Text style={[styles.status,{color:status?.allowed?"#15803D":"#B45309"}]}>{status?.allowed?"Open":"Closed"}</Text><Text style={styles.message}>{status?.message||"The server returned the current attendance status."}</Text></>}
    </View>
    <View style={styles.info}><Text style={styles.infoTitle}>Attendance submission</Text><Text style={styles.message}>The backend requires a date, your assigned class ID, and a list of student IDs with present/absent statuses. The submission form will be enabled after the live class and date contracts are verified against the production API.</Text></View>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#F4F6FA"},heading:{fontSize:24,fontWeight:"800",color:"#0F172A"},sub:{fontSize:12,color:"#64748B",lineHeight:18,marginTop:6},card:{backgroundColor:"#FFFFFF",padding:20,borderRadius:18,marginTop:20,borderWidth:1,borderColor:"#E5EAF1"},label:{fontSize:10,fontWeight:"800",letterSpacing:1.2,color:"#94A3B8"},status:{fontSize:24,fontWeight:"800",marginTop:14},message:{fontSize:12,color:"#64748B",lineHeight:19,marginTop:8},info:{backgroundColor:"#EFF6FF",padding:18,borderRadius:16,marginTop:14},infoTitle:{fontSize:14,fontWeight:"800",color:"#1E40AF"}});