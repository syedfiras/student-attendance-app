import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <View className="mb-2 py-4 flex-row items-center justify-between border-b border-slate-100 bg-white">
      <View>
        <Text className="text-base font-bold text-slate-900">
          {item.name}
        </Text>
        <Text className="text-sm text-slate-400 mt-1">
          {item.present}/{item.total} classes
        </Text>
      </View>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-xl font-bold text-slate-900">
          {item.percent}%
        </Text>
        <Text className="text-xs text-slate-400">attendance</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-4">
        {/* 📅 MONTH SELECTOR */}
        <TouchableOpacity
          className="mb-6 flex-row items-center gap-2"
          onPress={() => setShowMonthPicker(true)}
        >
          <Text className="text-3xl font-bold text-slate-900">
            {MONTHS[month]} {year}
          </Text>
          <Text className="text-slate-400 text-xl">▼</Text>
        </TouchableOpacity>

        {/* MONTH DROPDOWN */}
        <Modal transparent visible={showMonthPicker} animationType="fade">
          <TouchableOpacity
            className="flex-1 bg-black/20 justify-center"
            onPress={() => setShowMonthPicker(false)}
          >
            <View className="mx-6 rounded-2xl bg-white p-6 max-h-[70%] shadow-xl">
              <Text className="mb-4 text-xl font-bold text-slate-900">
                Select Month
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {MONTHS.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    className="py-4 border-b border-slate-100"
                    onPress={() => {
                      setMonth(i);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      className={`text-lg ${i === month
                        ? 'font-bold text-slate-900'
                        : 'text-slate-500'
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
          <View className="flex-1 justify-center items-center">
            <Text className="text-slate-400">No attendance data for this month.</Text>
          </View>
        ) : (
          <FlatList
            data={result}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 📤 EXPORT */}
        <View className="pt-4 pb-2 bg-white border-t border-slate-50">
          <TouchableOpacity
            className="items-center rounded-2xl bg-slate-900 py-4"
            onPress={exportCsv}
          >
            <Text className="font-semibold text-white">
              Export CSV
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReportScreen;
