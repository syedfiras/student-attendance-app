import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-calendars';

import { loadData, saveData, Student } from '../storage';

type RootStackParamList = {
  Attendance: { classId: string; className?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Attendance'>;

const AttendanceScreen: React.FC<Props> = ({ route, navigation }) => {
  const { classId, className } = route.params;

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<{ [id: string]: boolean }>({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: className ? `${className} - Attendance` : 'Attendance' });
  }, [className, navigation]);

  useEffect(() => {
    load();
  }, [selectedDate]);

  const load = async () => {
    const data = await loadData();

    const classStudents = data.students.filter(
      (s) => s.classId === classId
    );
    setStudents(classStudents);

    const existing = data.attendance.find(
      (a) => a.classId === classId && a.date === selectedDate
    );

    const initial: { [id: string]: boolean } = {};
    classStudents.forEach((s) => {
      initial[s.id] = existing ? !!existing.records[s.id] : true;
    });

    setRecords(initial);
  };

  const toggle = (id: string) => {
    setRecords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveAttendance = async () => {
    const data = await loadData();

    const index = data.attendance.findIndex(
      (a) => a.classId === classId && a.date === selectedDate
    );

    const entry = {
      id: index >= 0 ? data.attendance[index].id : 'att_' + Date.now(),
      classId,
      date: selectedDate,
      records,
    };

    if (index >= 0) data.attendance[index] = entry;
    else data.attendance.push(entry);

    await saveData(data);
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: Student }) => {
    const isPresent = records[item.id];
    return (
      <TouchableOpacity
        onPress={() => toggle(item.id)}
        className="mb-2 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white"
        activeOpacity={0.7}
      >
        <View>
          <Text className="text-lg font-bold text-slate-900">
            {item.name}
          </Text>
          <Text className="text-sm text-slate-400 mt-1">
            {item.usn ? `USN: ${item.usn}` : 'No USN'}
          </Text>
        </View>

        <View className={`px-4 py-2 rounded-full ${isPresent ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <Text className={`font-semibold text-xs ${isPresent ? 'text-white' : 'text-slate-500'}`}>
            {isPresent ? 'PRESENT' : 'ABSENT'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-4">
        {/* 📅 CALENDAR DROPDOWN BUTTON */}
        <TouchableOpacity
          className="mb-6 flex-row items-center gap-2"
          onPress={() => setShowCalendar(true)}
        >
          <Text className="text-3xl font-bold text-slate-900">
            {selectedDate}
          </Text>
          <Text className="text-slate-400 text-xl">▼</Text>
        </TouchableOpacity>

        {/* 📅 CALENDAR DROPDOWN */}
        <Modal transparent animationType="fade" visible={showCalendar}>
          <TouchableOpacity
            className="flex-1 bg-black/20 justify-center"
            onPress={() => setShowCalendar(false)}
            activeOpacity={1}
          >
            <View className="mx-6 rounded-2xl bg-white p-4 shadow-xl">
              <Calendar
                current={selectedDate}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    selectedColor: '#0f172a', // slate-900
                  },
                }}
                theme={{
                  todayTextColor: '#0f172a',
                  arrowColor: '#0f172a',
                  dotColor: '#0f172a',
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* 👥 STUDENTS */}
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        {/* 💾 SAVE */}
        <View className="pt-4 pb-2 bg-white border-t border-slate-50">
          <TouchableOpacity
            className="items-center rounded-2xl bg-slate-900 py-4"
            onPress={saveAttendance}
          >
            <Text className="font-semibold text-white">
              Save Attendance
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AttendanceScreen;
