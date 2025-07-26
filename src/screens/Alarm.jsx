import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Voice from '@react-native-voice/voice';

import { loadAlarms, handleSpeechResults } from './AlarmUtils';

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    loadAlarms(setAlarms); // Run once on mount

    Voice.onSpeechResults = e => {
      if (e.value) {
        handleSpeechResults(e.value[0], alarmsRef.current, setAlarms);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const alarmsRef = React.useRef([]);
  useEffect(() => {
    alarmsRef.current = alarms; // Keep current alarms accessible
  }, [alarms]);

  const startListening = async () => {
    try {
      if (Voice) {
        await Voice.start('en-US');
      } else {
        console.warn('Voice module is not loaded');
      }
    } catch (e) {
      console.error('Voice start error:', e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.alarmItems}>
      <View style={styles.alarmTime}>
        <Text style={styles.alarmTimeText}>{item.time}</Text>
        <Text style={styles.grayText}>Ring Once</Text>
      </View>
      <View style={{ alignSelf: 'center' }}>
        <FontAwesome name="toggle-off" size={28} color="white" />
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
            {alarms.length > 0
              ? 'Tap + and speak to add/delete'
              : 'All Alarms are turned off.'}
          </Text>
        </View>
      </View>

      <FlatList
        data={alarms}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />

      <View style={styles.buttonView}>
        <Pressable style={styles.addButton} onPress={startListening}>
          <MaterialIcons name="add" size={24} color="white" />
        </Pressable>
      </View>
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
