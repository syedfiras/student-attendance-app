import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ATTENDANCE_DATA_V1';

const defaultData = {
  classes: [],
  students: [],
  attendance: []
};

export const loadData = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultData;
  } catch (e) {
    console.log('Error loading:', e);
    return defaultData;
  }
};

export const saveData = async (data) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.log('Error saving:', e);
  }
};
