import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loadData } from '../storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type RootStackParamList = {
  Report: { classId: string; className?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

interface ReportRow {
  id: string;
  name: string;
  usn?: string;
  present: number;
  total: number;
  percent: number;
}

// Month names
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ReportScreen: React.FC<Props> = ({ route }) => {
  const { classId, className } = route.params;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [year, setYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [result, setResult] = useState<ReportRow[]>([]);

  useEffect(() => {
    load();
  }, [month, year]);

  const load = async () => {
    const data = await loadData();

    const students = data.students.filter(
      (s) => s.classId === classId
    );

    const monthStr = String(month + 1).padStart(2, '0');

    const attendance = data.attendance.filter(
      (a) =>
        a.classId === classId &&
        a.date.startsWith(`${year}-${monthStr}`)
    );

    const mapped: ReportRow[] = students.map((stu) => {
      let present = 0;
      attendance.forEach((att) => {
        if (att.records[stu.id]) present++;
      });

      const total = attendance.length;
      const percent = total
        ? Math.round((present / total) * 100)
        : 0;

      return {
        id: stu.id,
        name: stu.name,
        usn: stu.usn,
        present,
        total,
        percent,
      };
    });

    setResult(mapped);
  };

  // 📤 EXPORT CSV (WEB + MOBILE)
  const exportCsv = async () => {
  if (!result.length) {
    Alert.alert('No data', 'No attendance data to export.');
    return;
  }

  const header = 'Name,USN,Present,Total,Percent\n';
  const rows = result
    .map(
      (r) =>
        `${r.name},${r.usn ?? ''},${r.present},${r.total},${r.percent}`
    )
    .join('\n');

  const csv = header + rows;
  const fileName = `attendance_${month + 1}_${year}.csv`;

  // 🌐 WEB
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // 📱 MOBILE (iOS + Android)
try {
  const fs = FileSystem as any;

  // ✅ IMPORTANT FIX
  const dir =
    fs.documentDirectory ??
    fs.cacheDirectory;

  if (!dir) {
    Alert.alert('Error', 'File system not available.');
    return;
  }

  const fileUri = dir + fileName;

  await FileSystem.writeAsStringAsync(fileUri, csv);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Error', 'Sharing not available on this device.');
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Attendance CSV',
    UTI: 'public.comma-separated-values-text', // ✅ iOS critical
  });
} catch (error) {
  console.log('CSV export error:', error);
  Alert.alert('Error', 'Failed to export CSV.');
}


};


  const renderItem = ({ item }: { item: ReportRow }) => (
    <View className="mb-2 flex-row items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <View>
        <Text className="text-base font-semibold text-slate-800">
          {item.name}
        </Text>
        {item.usn && (
          <Text className="text-xs text-slate-500">
            USN: {item.usn}
          </Text>
        )}
        <Text className="text-xs text-slate-500">
          {item.present}/{item.total} classes
        </Text>
      </View>
      <Text className="font-bold text-blue-700">
        {item.percent}%
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-100 p-4">
      {/* 📅 MONTH SELECTOR */}
      <TouchableOpacity
        className="mb-4 rounded-xl bg-white border border-slate-300 px-4 py-3"
        onPress={() => setShowMonthPicker(true)}
      >
        <Text className="font-semibold text-slate-700">
          {MONTHS[month]} {year} ⬇️
        </Text>
      </TouchableOpacity>

      {/* MONTH DROPDOWN */}
      <Modal transparent visible={showMonthPicker} animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center"
          onPress={() => setShowMonthPicker(false)}
        >
          <View className="mx-6 rounded-xl bg-white p-4 max-h-[70%]">
            <Text className="mb-3 text-lg font-bold">
              Select Month
            </Text>

            <ScrollView>
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  className="py-3 border-b border-slate-200"
                  onPress={() => {
                    setMonth(i);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    className={`text-base ${i === month
                        ? 'font-bold text-blue-600'
                        : 'text-slate-700'
                      }`}
                  >
                    {m} {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 📊 REPORT */}
      {result.length === 0 ? (
        <Text className="text-slate-500">
          No attendance data for this month.
        </Text>
      ) : (
        <FlatList
          data={result}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      {/* 📤 EXPORT */}
      <TouchableOpacity
        className="mt-4 items-center rounded-xl bg-blue-600 py-3"
        onPress={exportCsv}
      >
        <Text className="font-semibold text-white">
          Export CSV
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReportScreen;
