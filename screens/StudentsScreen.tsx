import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { loadData, saveData } from '../app/storage';

export default function StudentsScreen({ route, navigation }) {
  const { classId, className } = route.params;
  const [students, setStudents] = useState([]);

  const load = async () => {
    const data = await loadData();
    setStudents(data.students.filter(s => s.classId === classId));
  };

  useEffect(() => {
    navigation.setOptions({ title: className || 'Students' });
  }, [className, navigation]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const deleteStudent = (student) => {
    Alert.alert(
      'Delete Student',
      `Delete student "${student.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const data = await loadData();
            data.students = data.students.filter(s => s.id !== student.id);

            // remove from attendance records
            data.attendance = data.attendance.map(a => {
              const newRecords = { ...a.records };
              delete newRecords[student.id];
              return { ...a, records: newRecords };
            });

            await saveData(data);
            load();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View className="mb-3 rounded-xl border border-slate-200 bg-white p-4 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-800">{item.name}</Text>
        {item.rollNo ? (
          <Text className="text-xs text-slate-500 mt-1">Roll No: {item.rollNo}</Text>
        ) : null}
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="px-3 py-1 rounded-full bg-blue-100"
          onPress={() =>
            navigation.navigate('StudentForm', {
              classId,
              studentId: item.id,
              name: item.name,
              rollNo: item.rollNo
            })
          }
        >
          <Text className="text-xs font-semibold text-blue-700">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-3 py-1 rounded-full bg-red-100"
          onPress={() => deleteStudent(item)}
        >
          <Text className="text-xs font-semibold text-red-700">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-100 p-4">
      {students.length === 0 ? (
        <Text className="text-center text-slate-500 mt-4">
          No students yet. Add your first student.
        </Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      <View className="mt-4 gap-3">
        <TouchableOpacity
          className="rounded-xl bg-emerald-600 py-3 items-center"
          onPress={() => navigation.navigate('StudentForm', { classId })}
        >
          <Text className="text-white font-semibold">Add Student</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-xl bg-blue-600 py-3 items-center"
          onPress={() => navigation.navigate('Attendance', { classId, className })}
        >
          <Text className="text-white font-semibold">Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-xl bg-purple-600 py-3 items-center"
          onPress={() => navigation.navigate('Report', { classId, className })}
        >
          <Text className="text-white font-semibold">Monthly Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
