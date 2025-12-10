import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { loadData } from '../app/storage';

export default function ReportScreen({ route }) {
  const { classId, className } = route.params;

  const [result, setResult] = useState([]);
  const [month] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());

  const load = async () => {
    const data = await loadData();

    const students = data.students.filter(s => s.classId === classId);

    const attendance = data.attendance.filter(a =>
      a.classId === classId &&
      a.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)
    );

    const mapped = students.map(stu => {
      let present = 0;
      attendance.forEach(att => {
        if (att.records[stu.id]) present++;
      });

      const total = attendance.length;
      const percent = total ? Math.round((present / total) * 100) : 0;

      return {
        id: stu.id,
        name: stu.name,
        present,
        total,
        percent
      };
    });

    setResult(mapped);
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = async () => {
    if (!result.length) {
      Alert.alert('No data', 'No attendance data to export for this month.');
      return;
    }

    try {
      const header = 'Name,Present,Total,Percent\n';
      const rows = result
        .map(r => `${r.name},${r.present},${r.total},${r.percent}`)
        .join('\n');
      const csv = header + rows;

      const fileName = `attendance_${className || classId}_${month}_${year}.csv`
        .replace(/\s+/g, '_');
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share attendance CSV',
        });
      } else {
        Alert.alert('Saved', `CSV saved to: ${fileUri}`);
      }
    } catch (e) {
      console.log('CSV export error', e);
      Alert.alert('Error', 'Failed to export CSV.');
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', {
    month: 'long'
  });

  const renderItem = ({ item }) => (
    <View className="mb-2 rounded-xl border border-slate-200 bg-white p-4 flex-row justify-between items-center">
      <View>
        <Text className="text-base font-semibold text-slate-800">{item.name}</Text>
        <Text className="text-xs text-slate-500 mt-1">
          {item.present}/{item.total} classes
        </Text>
      </View>
      <Text className="text-sm font-semibold text-blue-700">
        {item.percent}%
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-100 p-4">
      <Text className="text-lg font-bold text-slate-800">
        {className ? `${className} – ` : ''}Attendance Report
      </Text>
      <Text className="text-sm text-slate-500 mb-4">
        {monthName} {year}
      </Text>

      {result.length === 0 ? (
        <Text className="mt-4 text-slate-500">
          No attendance data found for this month.
        </Text>
      ) : (
        <FlatList
          data={result}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      <TouchableOpacity
        className="mt-4 rounded-xl bg-blue-600 py-3 items-center"
        onPress={exportCsv}
      >
        <Text className="text-white font-semibold">Export as CSV</Text>
      </TouchableOpacity>
    </View>
  );
}
