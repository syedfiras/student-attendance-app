import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { loadData, saveData } from '../app/storage';
import { formatDate } from '../utils/dates';

export default function AttendanceScreen({ route, navigation }) {
  const { classId, className } = route.params;

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: `Attendance - ${className || ''}`
    });
  }, [className, navigation]);

  const loadForDate = async (targetDate) => {
    const data = await loadData();
    const classStudents = data.students.filter(s => s.classId === classId);
    setStudents(classStudents);

    const dateKey = formatDate(targetDate);
    const existing = data.attendance.find(
      a => a.classId === classId && a.date === dateKey
    );

    if (existing) {
      setRecords(existing.records);
    } else {
      const blank = {};
      classStudents.forEach(s => (blank[s.id] = true));
      setRecords(blank);
    }
  };

  useEffect(() => {
    loadForDate(date);
  }, [date]);

  const onChangeDate = (_event, selected) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (selected) setDate(selected);
  };

  const toggle = (id) => {
    setRecords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveAttendance = async () => {
    const data = await loadData();
    const dateKey = formatDate(date);

    const idx = data.attendance.findIndex(
      a => a.classId === classId && a.date === dateKey
    );

    if (idx !== -1) {
      data.attendance[idx].records = records;
    } else {
      data.attendance.push({
        id: 'att_' + Date.now(),
        classId,
        date: dateKey,
        records
      });
    }

    await saveData(data);
    navigation.goBack();
  };

  const dateLabel = formatDate(date);

  const renderItem = ({ item }) => (
    <View className="mb-2 flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <Text className="text-slate-800">{item.name}</Text>
      <TouchableOpacity
        className={`px-3 py-1 rounded-full ${
          records[item.id] ? 'bg-emerald-100' : 'bg-red-100'
        }`}
        onPress={() => toggle(item.id)}
      >
        <Text
          className={`text-xs font-semibold ${
            records[item.id] ? 'text-emerald-700' : 'text-red-700'
          }`}
        >
          {records[item.id] ? 'Present' : 'Absent'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-100 p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-800">
          Date: {dateLabel}
        </Text>
        <TouchableOpacity
          className="rounded-full border border-slate-300 px-3 py-1 bg-white"
          onPress={() => setShowPicker(true)}
        >
          <Text className="text-xs font-semibold text-slate-700">Change Date</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <TouchableOpacity
        className="mt-4 rounded-xl bg-emerald-600 py-3 items-center"
        onPress={saveAttendance}
      >
        <Text className="text-white font-semibold">Save Attendance</Text>
      </TouchableOpacity>
    </View>
  );
}
