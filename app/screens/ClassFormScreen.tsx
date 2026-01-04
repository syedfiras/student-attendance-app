// screens/ClassFormScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadData, saveData } from '../storage';

/* ---------- Navigation Params ---------- */

type RootStackParamList = {
  ClassForm: {
    classId?: string;
    name?: string;
    section?: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ClassForm'>;

/* ---------- Component ---------- */

const ClassFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const editing = !!route?.params?.classId;
  const [name, setName] = useState(route?.params?.name || '');
  const [section, setSection] = useState(route?.params?.section || '');

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit Class' : 'Add Class' });
  }, [editing, navigation]);

  const onSave = async () => {
    if (!name.trim()) return;

    const data = await loadData();

    if (editing && route.params?.classId) {
      data.classes = data.classes.map((c) =>
        c.id === route.params!.classId ? { ...c, name, section } : c
      );
    } else {
      data.classes.push({
        id: 'class_' + Date.now(),
        name,
        section,
      });
    }

    await saveData(data);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 flex-1">
        <Text className="text-3xl font-bold text-slate-900 mb-8">
          {editing ? 'Edit Class' : 'New Class'}
        </Text>

        <View className="gap-6">
          <View>
            <Text className="text-sm font-medium text-slate-900 mb-2 ml-1">Class Name</Text>
            <TextInput
              placeholder="e.g. 10"
              value={name}
              onChangeText={setName}
              className="bg-slate-50 rounded-xl px-4 py-4 text-base text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-900 mb-2 ml-1">Section (Optional)</Text>
            <TextInput
              placeholder="e.g. A"
              value={section}
              onChangeText={setSection}
              className="bg-slate-50 rounded-xl px-4 py-4 text-base text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            className="mt-4 rounded-2xl bg-slate-900 py-4 items-center"
            onPress={onSave}
          >
            <Text className="text-white font-semibold text-lg">
              {editing ? 'Save Changes' : 'Create Class'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ClassFormScreen;
