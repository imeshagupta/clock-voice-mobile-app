const STORAGE_KEY = 'ALARMS_LIST';

export const loadAlarms = async setAlarms => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
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
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  } catch (err) {
    console.log('Error saving alarms', err);
  }
};
