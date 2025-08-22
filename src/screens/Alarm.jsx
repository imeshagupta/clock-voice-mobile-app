import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

const STORAGE_KEY = 'ALARMS_LIST';

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const loadAlarms = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAlarms(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Error loading alarms:', err);
    }
  };

  const saveAlarms = async data => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Error saving alarms:', err);
    }
  };

  useEffect(() => {
    loadAlarms();

    PushNotification.createChannel({
      channelId: 'alarm-channel',
      channelName: 'Alarm Notifications',
    });
  }, []);

  const addAlarm = (event, selectedDate) => {
    setShowPicker(false);

    if (!selectedDate || event.type === 'dismissed') return;

    const alarmTime = selectedDate;

    const newAlarm = {
      id: Date.now().toString(),
      time: alarmTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: alarmTime,
    };

    const updated = [...alarms, newAlarm];
    setAlarms(updated);
    saveAlarms(updated);

    PushNotification.localNotificationSchedule({
      channelId: 'alarm-channel',
      message: `Alarm for ${newAlarm.time}`,
      date: alarmTime,
      allowWhileIdle: true,
    });

    Alert.alert('✅ Alarm Set', `Your alarm is set for ${newAlarm.time}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.alarmItems}>
      <View style={styles.alarmTime}>
        <Text style={styles.alarmTimeText}>{item.time}</Text>
        <Text style={styles.grayText}>Ring Once</Text>
      </View>
      <View style={{ alignSelf: 'center' }}>
        <FontAwesome name="toggle-on" size={28} color="white" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headingText}>Alarm</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.subHeadingText}>{alarms.length} alarms | </Text>
          <Text style={styles.subHeadingText}>
            {alarms.length > 0 ? 'Tap + to add alarm' : 'No alarms set'}
          </Text>
        </View>
      </View>

      {/* List of Alarms */}
      <FlatList
        data={alarms}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(item?.id ?? index)}
      />

      {/* Add Button */}
      <View style={styles.buttonView}>
        <Pressable style={styles.addButton} onPress={() => setShowPicker(true)}>
          <MaterialIcons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* DateTime Picker */}
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={false}
          onChange={addAlarm}
        />
      )}
    </View>
  );
};

export default Alarm;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  header: {
    padding: 10,
    marginTop: 50,
  },
  headingText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '400',
  },
  subHeadingText: {
    color: '#d2c4c4ff',
  },
  alarmItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 10,
  },
  alarmTime: {
    flexDirection: 'column',
  },
  alarmTimeText: {
    color: 'white',
    fontSize: 30,
  },
  grayText: {
    color: '#d2c4c4ff',
    fontSize: 14,
    paddingTop: 5,
  },
  buttonView: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 10,
  },
});
