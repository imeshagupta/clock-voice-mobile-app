import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadAlarms = async setAlarms => {
  try {
    const saved = await AsyncStorage.getItem('alarms');
    if (saved) {
      setAlarms(JSON.parse(saved));
    } else {
      setAlarms([]);
    }
  } catch (err) {
    console.log('Error loading alarms', err);
    setAlarms([]);
  }
};

export const saveAlarms = async alarms => {
  try {
    await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
  } catch (err) {
    console.log('Error saving alarms', err);
  }
};
