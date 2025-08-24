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
import PushNotification from 'react-native-push-notification';
import { loadAlarms, saveAlarms } from './AlarmUtils';

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);

  useEffect(() => {
    loadAlarms(setAlarms);

    PushNotification.createChannel({
      channelId: 'alarm-channel',
      channelName: 'Alarm Notifications',
      soundName: 'Alarm.wav',
      importance: 4,
      vibrate: true,
    });
  }, []);

  const handleSave = updated => {
    setAlarms(updated);
    saveAlarms(updated);
  };

  const addOrEditAlarm = (event, selectedDate) => {
    setShowPicker(false);

    if (!selectedDate || event.type === 'dismissed') return;

    const alarmTime = selectedDate;
    const formattedTime = alarmTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    let updated;
    if (editingAlarm) {
      updated = alarms.map(alarm =>
        alarm.id === editingAlarm.id
          ? { ...alarm, time: formattedTime, date: alarmTime }
          : alarm,
      );
      setEditingAlarm(null);
    } else {
      const newAlarm = {
        id: Date.now().toString(),
        time: formattedTime,
        date: alarmTime,
        enabled: true,
      };
      updated = [...alarms, newAlarm];

      PushNotification.localNotificationSchedule({
        channelId: 'alarm-channel',
        message: `Alarm for ${formattedTime}`,
        date: alarmTime,
        allowWhileIdle: true,
        soundName: 'alarm.wav',
        playSound: true,
      });

      Alert.alert('✅ Alarm Set', `Your alarm is set for ${formattedTime}`);
    }

    handleSave(updated);
  };

  const toggleAlarm = id => {
    const updated = alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm,
    );
    handleSave(updated);
  };

  const deleteAlarm = id => {
    const updated = alarms.filter(alarm => alarm.id !== id);
    handleSave(updated);
  };

  const editAlarm = alarm => {
    setEditingAlarm(alarm);
    setShowPicker(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.alarmItems}>
      <View style={styles.alarmTime}>
        <Text style={styles.alarmTimeText}>{item.time}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => toggleAlarm(item.id)}>
          <FontAwesome
            name={item.enabled ? 'toggle-on' : 'toggle-off'}
            size={28}
            color="white"
          />
        </Pressable>
        <Pressable onPress={() => editAlarm(item)} style={{ marginLeft: 15 }}>
          <MaterialIcons name="edit" size={26} color="#d2c4c4ff" />
        </Pressable>
        <Pressable
          onPress={() => deleteAlarm(item.id)}
          style={{ marginLeft: 15 }}
        >
          <MaterialIcons name="delete" size={26} color="#d2c4c4ff" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingText}>Alarm</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.subHeadingText}>{alarms.length} alarms | </Text>
          <Text style={styles.subHeadingText}>
            {alarms.length > 0 ? 'Tap + to add alarm' : 'No alarms set'}
          </Text>
        </View>
      </View>

      <FlatList
        data={alarms}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(item?.id ?? index)}
      />

      <View style={styles.buttonView}>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            setEditingAlarm(null);
            setShowPicker(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {showPicker && (
        <DateTimePicker
          value={editingAlarm ? new Date(editingAlarm.date) : new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={false}
          onChange={addOrEditAlarm}
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
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
