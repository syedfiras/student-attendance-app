// screens/StudentFormScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadData, saveData } from '../storage';

// --- Navigation params for this screen ---
type RootStackParamList = {
  StudentForm: {
    classId: string;
    studentId?: string;
    name?: string;
    rollNo?: string;
    usn?: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'StudentForm'>;

const StudentFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId, studentId, name: initialName, rollNo: initialRoll, usn: initialUSN } = route.params;

  const editing = !!studentId;

  const [name, setName] = useState(initialName || '');
  const [rollNo, setRollNo] = useState(initialRoll || '');
  const [usn, setusn] = useState(initialUSN || '');
  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit Student' : 'Add Student' });
  }, [editing, navigation]);

  const onSave = async (): Promise<void> => {
    if (!name.trim()) return;

    const data = await loadData();

    if (editing) {
      // update existing student
      data.students = data.students.map((s) =>
        s.id === studentId ? { ...s, name, rollNo, usn } : s
      );
    } else {
      // create new student
      data.students.push({
        id: 'stu_' + Date.now(),
        classId,
        name,
        rollNo,
        usn,
      });
    }

    await saveData(data);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 flex-1">
        <Text className="text-3xl font-bold text-slate-900 mb-8">
          {editing ? 'Edit Student' : 'New Student'}
        </Text>

        <View className="gap-6">
          <View>
            <Text className="text-sm font-medium text-slate-900 mb-2 ml-1">Student Name</Text>
            <TextInput
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              className="bg-slate-50 rounded-xl px-4 py-4 text-base text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-900 mb-2 ml-1">Roll No (Optional)</Text>
            <TextInput
              placeholder="e.g. 1"
              value={rollNo}
              onChangeText={setRollNo}
              className="bg-slate-50 rounded-xl px-4 py-4 text-base text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-900 mb-2 ml-1">USN / ID (Optional)</Text>
            <TextInput
              placeholder="e.g. 1AB23..."
              value={usn}
              onChangeText={setusn}
              className="bg-slate-50 rounded-xl px-4 py-4 text-base text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            className="mt-4 rounded-2xl bg-slate-900 py-4 items-center"
            onPress={onSave}
          >
            <Text className="text-white font-semibold text-lg">
              {editing ? 'Save Changes' : 'Add Student'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StudentFormScreen;
