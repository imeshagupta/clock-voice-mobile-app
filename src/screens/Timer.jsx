import React, { useEffect, useState, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Voice from '@react-native-voice/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Timer = () => {
  const [timers, setTimers] = useState([]);
  const [activeTimerId, setActiveTimerId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const defaultTimers = [
    { id: '1', title: 'Brush Teeth', duration: 2 * 60 },
    { id: '2', title: 'Face Mask', duration: 15 * 60 },
    { id: '3', title: 'Boil Eggs', duration: 10 * 60 },
    { id: '4', title: 'Timer', duration: 15 * 60 },
    { id: '5', title: 'Sit up', duration: 30 * 60 },
  ];

  useEffect(() => {
    loadTimers();
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = e => console.log('Voice Error:', e);
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (isRunning && activeTimerId) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, activeTimerId]);

  useEffect(() => {
    saveTimers();
  }, [timers]);

  const loadTimers = async () => {
    const stored = await AsyncStorage.getItem('timers');
    if (stored) {
      setTimers(JSON.parse(stored));
    } else {
      setTimers(defaultTimers);
    }
  };

  const saveTimers = async () => {
    await AsyncStorage.setItem('timers', JSON.stringify(timers));
  };

  const startListening = async () => {
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.log('Voice start error:', e);
    }
  };

  const onSpeechResults = e => {
    const spoken = e.value[0]?.toLowerCase();
    console.log('Heard:', spoken);

    if (spoken.startsWith('start')) {
      const title = spoken.replace('start', '').trim();
      const found = timers.find(t => t.title.toLowerCase() === title);
      if (found) {
        startTimer(found.id);
      } else {
        Alert.alert('Timer not found');
      }
    } else if (spoken.startsWith('add')) {
      handleAddVoiceTimer(spoken);
    } else if (spoken.includes('pause') || spoken.includes('stop')) {
      setIsRunning(false);
    } else if (spoken.includes('reset')) {
      setCurrentTime(0);
      setIsRunning(false);
      setActiveTimerId(null);
    } else {
      Alert.alert(
        'Unknown Command',
        'Try "start boil eggs" or "add jump 5 minutes"',
      );
    }
  };

  const handleAddVoiceTimer = sentence => {
    const parts = sentence.split(' ');
    const indexOfMinutes = parts.indexOf('minutes');
    if (indexOfMinutes > 1) {
      const duration = parseInt(parts[indexOfMinutes - 1]);
      const title = parts.slice(1, indexOfMinutes - 1).join(' ');
      if (!isNaN(duration)) {
        const newTimer = {
          id: Date.now().toString(),
          title: title.trim(),
          duration: duration * 60,
        };
        setTimers(prev => [...prev, newTimer]);
      } else {
        Alert.alert('Invalid duration');
      }
    } else {
      Alert.alert('Try: add boil eggs 10 minutes');
    }
  };

  const startTimer = id => {
    setActiveTimerId(id);
    setCurrentTime(0);
    setIsRunning(true);
  };

  const renderTimerItem = ({ item }) => {
    const isActive = item.id === activeTimerId;
    const timeLeft = isActive
      ? Math.max(item.duration - currentTime, 0)
      : item.duration;

    const mins = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    return (
      <Pressable style={styles.item} onPress={() => startTimer(item.id)}>
        <Text style={styles.itemText}>{item.title}</Text>
        <Text style={styles.itemText}>
          {mins}:{secs}
        </Text>
      </Pressable>
    );
  };

  const totalMins = Math.floor(currentTime / 60)
    .toString()
    .padStart(2, '0');
  const totalSecs = (currentTime % 60).toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingText}>Timer</Text>
        <Pressable style={styles.addBtn} onPress={startListening}>
          <MaterialIcons name="mic" size={24} color="white" />
        </Pressable>
      </View>

      {/* Always show main timer at top */}
      <View style={styles.mainTimer}>
        <Text style={styles.mainTimerText}>
          {totalMins}:{totalSecs}
        </Text>
      </View>

      <FlatList
        data={timers}
        renderItem={renderTimerItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.timerItems}
      />

      <View style={styles.buttonView}>
        <Pressable
          style={styles.playPauseBtn}
          onPress={() => setIsRunning(!isRunning)}
        >
          <MaterialIcons
            name={isRunning ? 'pause' : 'play-arrow'}
            size={24}
            color="white"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default Timer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  header: {
    padding: 20,
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headingText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '400',
  },
  addBtn: {
    alignSelf: 'flex-end',
  },
  mainTimer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  mainTimerText: {
    fontSize: 48,
    color: '#d2c4c4ff',
    fontWeight: 'bold',
  },
  timerItems: {
    gap: 10,
    paddingHorizontal: 5,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#d2c4c466',
    paddingHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 5,
  },
  itemText: {
    color: 'white',
    fontSize: 16,
  },
  buttonView: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 10,
  },
});
