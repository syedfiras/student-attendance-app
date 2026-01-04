import React, { useEffect, useState } from 'react';
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
    navigation.setOptions({ title: className || 'Mark Attendance' });
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

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      onPress={() => toggle(item.id)}
      className={`mb-3 flex-row items-center justify-between rounded-xl p-4 ${
        records[item.id] ? 'bg-emerald-100' : 'bg-red-100'
      }`}
    >
      <View>
        <Text className="font-semibold text-slate-800">
          {item.name}
        </Text>
        {item.usn && (
          <Text className="text-xs text-slate-600">
            USN: {item.usn}
          </Text>
        )}
      </View>

      <Text
        className={`font-bold ${
          records[item.id] ? 'text-emerald-700' : 'text-red-700'
        }`}
      >
        {records[item.id] ? 'PRESENT' : 'ABSENT'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-100 p-4">
      {/* 📅 CALENDAR DROPDOWN BUTTON */}
      <TouchableOpacity
        className="mb-4 rounded-xl bg-white border border-slate-300 px-4 py-3"
        onPress={() => setShowCalendar(true)}
      >
        <Text className="font-semibold text-slate-700">
          Date: {selectedDate} ⬇️
        </Text>
      </TouchableOpacity>

      {/* 📅 CALENDAR DROPDOWN */}
      <Modal transparent animationType="fade" visible={showCalendar}>
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center"
          onPress={() => setShowCalendar(false)}
          activeOpacity={1}
        >
          <View className="mx-6 rounded-xl bg-white p-4">
            <Text className="mb-2 text-lg font-bold text-slate-800">
              Select Date
            </Text>

            <Calendar
              current={selectedDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#2563eb',
                },
              }}
              theme={{
                todayTextColor: '#2563eb',
                arrowColor: '#2563eb',
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
      />

      {/* 💾 SAVE */}
      <TouchableOpacity
        className="mt-4 items-center rounded-xl bg-blue-600 py-3"
        onPress={saveAttendance}
      >
        <Text className="font-semibold text-white">
          Save Attendance
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttendanceScreen;
