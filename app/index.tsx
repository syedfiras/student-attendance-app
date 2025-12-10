import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ClassesScreen from '../screens/ClassesScreen';
import ClassFormScreen from '../screens/ClassFormScreen';
import StudentsScreen from '../screens/StudentsScreen';
import StudentFormScreen from '../screens/StudentFormScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ReportScreen from '../screens/ReportScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Classes">
        <Stack.Screen name="Classes" component={ClassesScreen} options={{ title: 'Classes' }} />
        <Stack.Screen name="ClassForm" component={ClassFormScreen} options={{ title: 'Add / Edit Class' }} />
        <Stack.Screen name="Students" component={StudentsScreen} options={{ title: 'Students' }} />
        <Stack.Screen name="StudentForm" component={StudentFormScreen} options={{ title: 'Add / Edit Student' }} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Mark Attendance' }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Monthly Report' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
