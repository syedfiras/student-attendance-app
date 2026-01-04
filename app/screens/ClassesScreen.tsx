// screens/ClassesScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadData, saveData } from '../storage';

const ClassesScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [classes, setClasses] = useState<any[]>([]);

  const load = async () => {
    const data = await loadData();
    setClasses(data.classes);
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const deleteClass = (cls: any) => {
    Alert.alert(
      'Delete Class',
      `Delete class "${cls.name}"? This will also delete its students and attendance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const data = await loadData();
            data.classes = data.classes.filter((c: any) => c.id !== cls.id);
            data.students = data.students.filter((s: any) => s.classId !== cls.id);
            data.attendance = data.attendance.filter((a: any) => a.classId !== cls.id);
            await saveData(data);
            load();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="mb-2 py-4 border-b border-slate-100 flex-row justify-between items-center"
      onPress={() =>
        navigation.navigate('Students', {
          classId: item.id,
          className: item.name,
        })
      }
    >
      <View className="flex-1">
        <Text className="text-xl font-bold text-slate-900">{item.name}</Text>
        {item.section ? (
          <Text className="text-sm text-slate-500 mt-1">{item.section}</Text>
        ) : null}
      </View>

      <View className="flex-row gap-4 items-center">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ClassForm', {
              classId: item.id,
              name: item.name,
              section: item.section,
            })
          }
        >
          <Text className="text-slate-900 font-medium text-sm">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteClass(item)}
        >
          <Text className="text-red-500 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white px-6 pt-4">
      <Text className="text-3xl font-bold text-slate-900 mb-6">Classes</Text>

      {classes.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-400">No classes found.</Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        className="absolute right-6 w-16 h-16 rounded-full bg-slate-900 items-center justify-center shadow-lg"
        style={{ bottom: 30 + insets.bottom }}
        onPress={() => navigation.navigate('ClassForm')}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClassesScreen;
