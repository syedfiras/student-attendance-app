import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { loadData, saveData } from '../app/storage';

export default function StudentFormScreen({ route, navigation }) {
  const { classId } = route.params;
  const editing = !!route.params?.studentId;

  const [name, setName] = useState(route.params?.name || '');
  const [rollNo, setRollNo] = useState(route.params?.rollNo || '');

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit Student' : 'Add Student' });
  }, [editing, navigation]);

  const onSave = async () => {
    if (!name.trim()) return;

    const data = await loadData();

    if (editing) {
      data.students = data.students.map(s =>
        s.id === route.params.studentId ? { ...s, name, rollNo } : s
      );
    } else {
      data.students.push({
        id: 'stu_' + Date.now(),
        name,
        rollNo,
        classId
      });
    }

    await saveData(data);
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-slate-100 p-4">
      <View className="gap-4">
        <TextInput
          placeholder="Student Name"
          value={name}
          onChangeText={setName}
          className="bg-white rounded-xl px-4 py-3 border border-slate-200"
        />
        <TextInput
          placeholder="Roll Number"
          value={rollNo}
          onChangeText={setRollNo}
          className="bg-white rounded-xl px-4 py-3 border border-slate-200"
        />
        <TouchableOpacity
          className="mt-2 rounded-xl bg-blue-600 py-3 items-center"
          onPress={onSave}
        >
          <Text className="text-white font-semibold">
            {editing ? 'Save Changes' : 'Add Student'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
