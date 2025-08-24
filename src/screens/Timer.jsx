import React, { useEffect, useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
      </View>

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
