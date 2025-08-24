import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Voice from '@react-native-voice/voice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';

const WorldClock = () => {
  const [clocks, setClocks] = useState([]);
  const [allTimeZones, setAllTimeZones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    loadTimeZones();
    loadStoredClocks();
    setupVoice();

    const interval = setInterval(() => {
      setClocks(prev =>
        prev.map(clock => ({
          ...clock,
          time: moment().tz(clock.timeZone).format('hh:mm A'),
        })),
      );
    }, 1000);

    return () => {
      clearInterval(interval);
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const setupVoice = () => {
    Voice.onSpeechResults = onSpeechResults;
  };

  const loadTimeZones = async () => {
    try {
      const response = await fetch('https://worldtimeapi.org/api/timezone');
      const data = await response.json();
      setAllTimeZones(data);
    } catch (err) {
      console.error('Failed to fetch time zones:', err);
    }
  };

  const loadStoredClocks = async () => {
    try {
      const saved = await AsyncStorage.getItem('worldClocks');
      if (saved) {
        setClocks(JSON.parse(saved));
      } else {
      
        const defaultClock = [
          {
            name: 'Delhi',
            timeZone: 'Asia/Kolkata',
            time: '',
          },
        ];
        setClocks(defaultClock);
        await AsyncStorage.setItem('worldClocks', JSON.stringify(defaultClock));
      }
    } catch (err) {
      console.error('Failed to load saved clocks:', err);
    }
  };

  const saveClocks = async updatedClocks => {
    try {
      await AsyncStorage.setItem('worldClocks', JSON.stringify(updatedClocks));
    } catch (err) {
      console.error('Failed to save clocks:', err);
    }
  };

  const onSpeechResults = e => {
    if (e.value && e.value.length > 0) {
      const spokenCity = e.value[0];
      setInput(spokenCity);
      handleAddCity(spokenCity);
    }
    setIsListening(false);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice start error:', error);
    }
  };

  const handleAddCity = (cityInput = input) => {
    if (!cityInput) {
      Alert.alert('Please enter a city name');
      return;
    }

    const normalize = str => str.trim().toLowerCase().replace(/\s+/g, '_');
    const inputNormalized = normalize(cityInput);

    const matchedTimeZone = allTimeZones.find(zone => {
      const zoneLower = zone.toLowerCase();
      return zoneLower.includes(inputNormalized);
    });

    if (!matchedTimeZone) {
      Alert.alert(
        'City not found',
        'Try using major cities (e.g., Tokyo, Paris, New York)',
      );
      return;
    }

    const alreadyExists = clocks.find(c => c.timeZone === matchedTimeZone);
    if (alreadyExists) {
      Alert.alert('Already added');
      return;
    }

    const zoneParts = matchedTimeZone.split('/');
    const cityName = zoneParts[zoneParts.length - 1].replace(/_/g, ' ');

    const updatedClocks = [
      ...clocks,
      { name: cityName, timeZone: matchedTimeZone, time: '' },
    ];

    setClocks(updatedClocks);
    saveClocks(updatedClocks);
    setInput('');
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.clockTiming}>
      <View style={{ flexDirection: 'column' }}>
        <Text style={styles.location}>{item.name}</Text>
        <Text style={styles.day}>Today</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingText}>World Clock</Text>
      </View>

      <FlatList
        data={clocks}
        keyExtractor={item => item.timeZone}
        renderItem={renderItem}
      />

      <View style={styles.buttonView}>
        <Pressable
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </Pressable>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Tokyo"
              placeholderTextColor="#aaa"
              value={input}
              onChangeText={setInput}
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Pressable
                onPress={() => handleAddCity()}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </Pressable>
              <Pressable onPress={startListening} style={styles.modalButton}>
                <MaterialIcons name="keyboard-voice" size={20} color="white" />
              </Pressable>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WorldClock;

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
  clockTiming: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 10,
  },
  location: {
    fontSize: 30,
    color: 'white',
  },
  day: {
    color: '#d2c4c4ff',
  },
  time: {
    color: 'white',
    fontSize: 30,
    fontWeight: '300',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
