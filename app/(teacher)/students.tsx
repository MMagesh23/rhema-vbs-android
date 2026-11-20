import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { apiRequest } from "@/services/api";
type Student = {_id:string;studentId?:string;name:string;grade?:string;village?:string;classAssigned?:{name?:string}};
type StudentResponse = {success:boolean;data:Student[];total?:number;pages?:number};
export default function StudentsScreen() {
  const [search,setSearch]=useState("");
  const query=useQuery({queryKey:["teacher-students"],queryFn:()=>apiRequest<StudentResponse>("/students?page=1&limit=100")});
  const students=(query.data?.data||[]).filter(s=>`${s.name} ${s.studentId||""} ${s.grade||""}`.toLowerCase().includes(search.toLowerCase()));
  return <View style={styles.screen}>
    <Text style={styles.heading}>My Students</Text><Text style={styles.sub}>Only students assigned to your teacher account are returned by the server.</Text>
    <TextInput value={search} onChangeText={setSearch} placeholder="Search name, ID or grade" style={styles.search}/>
    {query.isLoading?<ActivityIndicator style={{marginTop:40}} color="#2563EB"/>:query.isError?<Text style={styles.state}>Unable to load students. Pull down to retry or check your connection.</Text>:students.length===0?<Text style={styles.state}>No students found for this class.</Text>:
      <FlatList data={students} keyExtractor={item=>item._id} contentContainerStyle={{paddingBottom:24}} renderItem={({item})=><View style={styles.card}><View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase()||"S"}</Text></View><View style={{flex:1}}><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.studentId||"Student"}{item.grade? ` • Grade ${item.grade}`:""}</Text><Text style={styles.meta}>{item.classAssigned?.name||item.village||""}</Text></View></View>}/>
    }
  </View>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:"#F4F6FA",padding:18},heading:{fontSize:24,fontWeight:"800",color:"#0F172A"},sub:{fontSize:12,color:"#64748B",lineHeight:18,marginTop:6},search:{height:48,backgroundColor:"#FFFFFF",borderWidth:1,borderColor:"#E2E8F0",borderRadius:12,paddingHorizontal:14,marginTop:18,marginBottom:14},card:{flexDirection:"row",alignItems:"center",gap:12,backgroundColor:"#FFFFFF",padding:14,borderRadius:14,marginBottom:9},avatar:{width:40,height:40,borderRadius:13,backgroundColor:"#DBEAFE",alignItems:"center",justifyContent:"center"},avatarText:{color:"#1D4ED8",fontWeight:"800"},name:{fontSize:14,fontWeight:"700",color:"#0F172A"},meta:{fontSize:11,color:"#64748B",marginTop:4},state:{textAlign:"center",color:"#64748B",marginTop:40,fontSize:13}});