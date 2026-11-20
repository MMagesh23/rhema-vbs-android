import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { apiRequest } from "@/services/api";

type Student = { _id:string; name:string; studentId?:string; classAssigned?:{_id:string;name:string;category?:string} };
type StudentsResponse = { success:boolean; data:Student[]; total?:number; pages?:number; currentPage?:number };
type WindowStatus = { allowed:boolean; message:string; windowStart?:string; windowEnd?:string; currentTime?:string; minutesRemaining?:number; stopped?:boolean };
type WindowResponse = { success:boolean; data:WindowStatus };
type AttendanceRecord = { _id?:string; student?:{_id:string;name:string;studentId?:string}|string; status:"present"|"absent" };
type AttendanceEntry = { _id:string; date:string; class:string|{_id:string;name:string}; records:AttendanceRecord[] };
type AttendanceResponse = { success:boolean; count:number; data:AttendanceEntry[] };
type SubmitResponse = { success:boolean; message:string; data:AttendanceEntry };

function todayIST() {
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}

export default function AttendanceScreen() {
  const queryClient=useQueryClient();
  const date=todayIST();
  const studentsQuery=useQuery({
    queryKey:["teacher-students","attendance"],
    queryFn:()=>apiRequest<StudentsResponse>("/students?page=1&limit=100")
  });
  const windowQuery=useQuery({
    queryKey:["attendance-window"],
    queryFn:()=>apiRequest<WindowResponse>("/attendance/window-status"),
    refetchInterval:60_000
  });
  const recordsQuery=useQuery({
    queryKey:["teacher-attendance",date],
    queryFn:()=>apiRequest<AttendanceResponse>(`/attendance/students?date=${date}`)
  });

  const students=studentsQuery.data?.data ?? [];
  const classInfo=students.find(s=>s.classAssigned?._id)?.classAssigned;
  const submitted=recordsQuery.data?.data?.[0];
  const submittedMap=useMemo(()=>{
    const map=new Map<string,"present"|"absent">();
    for(const row of submitted?.records ?? []) {
      const id=typeof row.student==="string"?row.student:row.student?._id;
      if(id) map.set(id,row.status);
    }
    return map;
  },[submitted]);
  const mutation=useMutation({
    mutationFn:()=>apiRequest<SubmitResponse>("/attendance/students",{
      method:"POST",
      body:{
        date,
        classId:classInfo?._id,
        records:students.map(student=>({studentId:student._id,status:"present" as const}))
      }
    }),
    onSuccess:async response=>{
      await queryClient.invalidateQueries({queryKey:["teacher-attendance",date]});
      Alert.alert("Attendance submitted",response.message || "Attendance submitted successfully.");
    },
    onError:error=>Alert.alert("Submission failed",error instanceof Error?error.message:"Please try again.")
  });

  const window=windowQuery.data?.data;
  const loading=studentsQuery.isLoading||windowQuery.isLoading||recordsQuery.isLoading;
  const alreadySubmitted=Boolean(submitted);
  const canSubmit=Boolean(window?.allowed && classInfo && students.length>0 && !alreadySubmitted && !mutation.isPending);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Text style={styles.heading}>Student Attendance</Text>
    <Text style={styles.sub}>Review your assigned class and submit today's attendance. The server validates the schedule and submission window using IST.</Text>

    <View style={styles.statusCard}>
      <Text style={styles.label}>TODAY · {date}</Text>
      {windowQuery.isLoading?<ActivityIndicator color="#2563EB" style={{marginTop:16}}/>:
        windowQuery.isError?<Text style={styles.message}>Unable to check the attendance window. Pull to refresh or try again.</Text>:
        <><Text style={[styles.status,{color:window?.allowed?"#15803D":"#B45309"}]}>{window?.allowed?"Submission window open":"Submission window closed"}</Text><Text style={styles.message}>{window?.message}</Text></>}
    </View>

    {loading?<ActivityIndicator color="#2563EB" style={{marginTop:28}}/>:
      studentsQuery.isError||recordsQuery.isError?<Text style={styles.state}>Could not load class or attendance information. Please check your connection and retry.</Text>:
      !classInfo?<Text style={styles.state}>No class is assigned to this teacher account. Please contact your VBS administrator.</Text>:
      <View style={styles.card}>
        <Text style={styles.className}>{classInfo.name || "My assigned class"}</Text>
        <Text style={styles.message}>{students.length} students assigned</Text>
        {alreadySubmitted?
          <><View style={styles.success}><Text style={styles.successTitle}>Attendance already submitted</Text><Text style={styles.successText}>This class has an attendance record for today. Teachers cannot submit a duplicate.</Text></View>
            {students.map(student=><View key={student._id} style={styles.studentRow}><View style={{flex:1}}><Text style={styles.studentName}>{student.name}</Text><Text style={styles.studentMeta}>{student.studentId||"Student"}</Text></View><Text style={[styles.pill,{color:submittedMap.get(student._id)==="present"?"#15803D":"#B91C1C"}]}>{submittedMap.get(student._id)==="present"?"Present":submittedMap.get(student._id)==="absent"?"Absent":"—"}</Text></View>)}
          </>:
          <><Text style={styles.notice}>Phase 2 submission uses a safe default of Present for every student. Please verify attendance with your class before submitting. Individual present/absent editing will be added after the first device test.</Text>
            <Pressable disabled={!canSubmit} onPress={()=>Alert.alert("Confirm attendance",`Submit all ${students.length} students as Present for ${date}?`,[{text:"Cancel",style:"cancel"},{text:"Submit",onPress:()=>mutation.mutate()}])} style={[styles.submitButton,!canSubmit&&styles.disabled]}>
              {mutation.isPending?<ActivityIndicator color="#FFFFFF"/>:<Text style={styles.submitText}>Submit all as Present</Text>}
            </Pressable>
            {!window?.allowed?<Text style={styles.hint}>Submission is disabled because the backend attendance window is closed.</Text>:null}
          </>}
      </View>
    }
  </ScrollView>;
}

const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:"#F4F6FA"},content:{padding:20,paddingBottom:36},
 heading:{fontSize:24,fontWeight:"800",color:"#0F172A"},sub:{fontSize:12,color:"#64748B",lineHeight:19,marginTop:7},
 statusCard:{backgroundColor:"#FFFFFF",padding:18,borderRadius:16,marginTop:20,borderWidth:1,borderColor:"#E5EAF1"},
 label:{fontSize:10,fontWeight:"800",letterSpacing:1.2,color:"#94A3B8"},status:{fontSize:18,fontWeight:"800",marginTop:12},message:{fontSize:12,color:"#64748B",lineHeight:19,marginTop:6},
 card:{backgroundColor:"#FFFFFF",padding:18,borderRadius:16,marginTop:14,borderWidth:1,borderColor:"#E5EAF1"},
 className:{fontSize:17,fontWeight:"800",color:"#0F172A"},studentRow:{flexDirection:"row",alignItems:"center",paddingVertical:12,borderBottomWidth:1,borderBottomColor:"#F1F5F9"},
 studentName:{fontSize:13,fontWeight:"700",color:"#0F172A"},studentMeta:{fontSize:10,color:"#94A3B8",marginTop:3},pill:{fontSize:11,fontWeight:"800"},
 notice:{fontSize:12,color:"#92400E",backgroundColor:"#FEF3C7",padding:12,borderRadius:10,lineHeight:18,marginTop:18},
 success:{backgroundColor:"#ECFDF5",padding:13,borderRadius:10,marginTop:16,marginBottom:8},successTitle:{fontSize:13,fontWeight:"800",color:"#166534"},successText:{fontSize:11,color:"#166534",lineHeight:17,marginTop:4},
 submitButton:{height:50,backgroundColor:"#2563EB",borderRadius:12,alignItems:"center",justifyContent:"center",marginTop:18},submitText:{color:"#FFFFFF",fontWeight:"800",fontSize:14},disabled:{opacity:.4},
 hint:{fontSize:11,color:"#B45309",marginTop:10,lineHeight:16},state:{textAlign:"center",color:"#64748B",marginTop:30,fontSize:13,lineHeight:20}
});