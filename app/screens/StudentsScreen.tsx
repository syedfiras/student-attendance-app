import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
} from 'react-native';
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
    navigation.setOptions({ title: className || 'Students' });
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
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', fontSize: 16 }}>
          {item.name}
        </Text>
        {item.usn && (
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            USN: {item.usn}
          </Text>
        )}
        {item.rollNo && (
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            Roll No: {item.rollNo}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {/* ✏️ EDIT */}
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
          style={{
            backgroundColor: '#dbeafe',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: '#1d4ed8', fontSize: 12 }}>
            Edit
          </Text>
        </Pressable>

        {/* 🗑️ DELETE */}
        <Pressable
          onPress={() => deleteStudent(item)}
          style={{
            backgroundColor: '#fee2e2',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: '#b91c1c', fontSize: 12 }}>
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9', padding: 16 }}>
      {students.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#64748b' }}>
          No students added yet.
        </Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      {/* ➕ ADD STUDENT */}
      <Pressable
        onPress={() =>
          navigation.navigate('StudentForm', { classId })
        }
        style={{
          marginTop: 12,
          backgroundColor: '#059669',
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Add Student
        </Text>
      </Pressable>

      {/* 📅 MARK ATTENDANCE */}
      <Pressable
        onPress={() =>
          navigation.navigate('Attendance', {
            classId,
            className,
          })
        }
        style={{
          marginTop: 12,
          backgroundColor: '#2563eb',
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Mark Attendance
        </Text>
      </Pressable>

      {/* 📊 REPORT */}
      <Pressable
        onPress={() =>
          navigation.navigate('Report', {
            classId,
            className,
          })
        }
        style={{
          marginTop: 12,
          backgroundColor: '#7c3aed',
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Monthly Report
        </Text>
      </Pressable>
    </View>
  );
};

export default StudentsScreen;
