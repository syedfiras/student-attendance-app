import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadData, saveData, Student } from '../storage';

type RootStackParamList = {
  Students: { classId: string; className?: string };
  StudentForm: {
    classId: string;
    studentId?: string;
    name?: string;
    rollNo?: string;
    usn?: string;
  };
  Attendance: { classId: string; className?: string };
  Report: { classId: string; className?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Students'>;

const StudentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { classId, className } = route.params;

  const [students, setStudents] = useState<Student[]>([]);

  // 🔄 Load students from storage
  const load = async () => {
    const data = await loadData();
    const filtered = data.students.filter(
      (s) => s.classId === classId
    );
    setStudents(filtered);
  };

  useEffect(() => {
    navigation.setOptions({ title: className ? `${className} - Students` : 'Students' });
  }, [className, navigation]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  // 🗑️ GUARANTEED DELETE (UI first, storage second)
  const deleteStudent = async (student: Student) => {
    // 1️⃣ Remove from UI immediately
    setStudents((prev) =>
      prev.filter((s) => s.id !== student.id)
    );

    // 2️⃣ Remove from storage
    const data = await loadData();

    data.students = data.students.filter(
      (s) => s.id !== student.id
    );

    // Remove student from all attendance records
    data.attendance = data.attendance.map((a) => {
      const newRecords = { ...a.records };
      delete newRecords[student.id];
      return { ...a, records: newRecords };
    });

    await saveData(data);
  };

  const renderItem = ({ item }: { item: Student }) => (
    <View
      className="mb-2 py-4 border-b border-slate-100 flex-row justify-between items-center bg-white"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-slate-900">
          {item.name}
        </Text>
        <Text className="text-sm text-slate-400 mt-1">
          {item.usn ? `USN: ${item.usn}` : ''} {item.rollNo ? `• Roll: ${item.rollNo}` : ''}
        </Text>
      </View>

      <View className="flex-row gap-4 items-center">
        <Pressable
          onPress={() =>
            navigation.navigate('StudentForm', {
              classId,
              studentId: item.id,
              name: item.name,
              rollNo: item.rollNo,
              usn: item.usn,
            })
          }
        >
          <Text className="text-slate-900 font-medium text-sm">Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => deleteStudent(item)}
        >
          <Text className="text-red-500 text-sm">Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-4">

        {students.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-slate-400">No students added yet.</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <View className="pb-2 pt-4 bg-white border-t border-slate-50 gap-3">
          <View className="flex-row gap-3">
            {/* 📅 MARK ATTENDANCE */}
            <Pressable
              onPress={() => navigation.navigate('Attendance', { classId, className })}
              className="flex-1 bg-slate-100 py-4 rounded-2xl items-center"
            >
              <Text className="text-slate-900 font-semibold">Attendance</Text>
            </Pressable>

            {/* 📊 REPORT */}
            <Pressable
              onPress={() => navigation.navigate('Report', { classId, className })}
              className="flex-1 bg-slate-100 py-4 rounded-2xl items-center"
            >
              <Text className="text-slate-900 font-semibold">Report</Text>
            </Pressable>
          </View>
        </View>

        {/* ➕ FAB */}
        <TouchableOpacity
          className="absolute right-6 w-16 h-16 rounded-full bg-slate-900 items-center justify-center shadow-lg"
          style={{ bottom: 30 + insets.bottom + 80 }} // Adjusted to avoid overlap with bottom bar
          onPress={() => navigation.navigate('StudentForm', { classId })}
        >
          <Text className="text-white text-3xl font-light">+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentsScreen;
