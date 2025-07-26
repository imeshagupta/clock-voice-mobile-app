// alarmUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const loadAlarms = async setAlarms => {
  const saved = await AsyncStorage.getItem('alarms');
  if (saved) setAlarms(JSON.parse(saved));
};

export const saveAlarms = async alarms => {
  await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
};

export const handleSpeechResults = (text, alarms, setAlarms) => {
  text = text.toLowerCase();
  console.log('Recognized:', text);

  // ADD ALARM
  if (text.includes('add alarm')) {
    const match = text.match(/(\d{1,2})([:.])(\d{2})?\s?(am|pm)?/);
    const time = match
      ? `${parseInt(match[1])}:${match[3] || '00'} ${
          match[4]?.toUpperCase() || 'AM'
        }`
      : '7:30 AM';

    const newAlarm = { id: Date.now(), time, once: true };
    const updated = [...alarms, newAlarm];
    setAlarms(updated);
    saveAlarms(updated);
    return;
  }

  // DELETE ALARM BY TIME
  if (text.includes('delete alarm')) {
    const match = text.match(/(\d{1,2})([:.])(\d{2})?\s?(am|pm)?/);
    const spokenTime = match
      ? `${parseInt(match[1])}:${match[3] || '00'} ${
          match[4]?.toUpperCase() || 'AM'
        }`
      : null;

    if (spokenTime) {
      const updated = alarms.filter(alarm => alarm.time !== spokenTime);
      if (updated.length === alarms.length) {
        Alert.alert('Not Found', `No alarm at ${spokenTime}`);
      } else {
        setAlarms(updated);
        saveAlarms(updated);
        Alert.alert('Alarm Deleted', `Deleted alarm at ${spokenTime}`);
      }
    } else {
      // Fallback: delete last
      const updated = alarms.slice(0, -1);
      setAlarms(updated);
      saveAlarms(updated);
      Alert.alert('Deleted', 'Deleted last alarm');
    }
  }
};
