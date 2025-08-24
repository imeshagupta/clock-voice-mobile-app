import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Voice from '@react-native-voice/voice';
import { useEffect, useRef, useState } from 'react';

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = e => console.log('Voice Error:', e);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.stop();
      await Voice.start('en-US');
    } catch (e) {
      console.log('Voice start error:', e);
    }
  };

  const onSpeechResults = e => {
    const spoken = e.value[0]?.toLowerCase();
    console.log('Heard:', spoken);

    if (spoken.includes('start')) {
      setIsRunning(true);
    } else if (spoken.includes('pause') || spoken.includes('stop')) {
      setIsRunning(false);
    } else if (spoken.includes('reset')) {
      resetTimer();
    } else {
      Alert.alert('Unknown Command', 'Say "start", "pause", or "reset"');
    }
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      interval = setInterval(() => {
        const now = Date.now();
        setTime(now - startTimeRef.current);
      }, 10);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingText}>Stopwatch</Text>
      </View>

      <View style={styles.center}>
        <LinearGradient
          colors={['rgba(2, 2, 2, 1)', 'rgba(0, 0, 0, 1)']}
          style={styles.gradient}
        >
          <View style={styles.circle}>
            <Text style={styles.timer}>{formatTime(time)}</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'blue' }]}
          onPress={startListening}
        >
          <Ionicons name="mic" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formatTime = milliseconds => {
  const mins = Math.floor(milliseconds / 60000);
  const secs = Math.floor((milliseconds % 60000) / 1000);
  const ms = Math.floor((milliseconds % 1000) / 10);

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(
    2,
    '0',
  )}.${String(ms).padStart(2, '0')}`;
};

export default Stopwatch;

const styles = StyleSheet.create({
  container: { backgroundColor: 'black', flex: 1 },
  header: { padding: 20, marginTop: 50 },
  headingText: { color: 'white', fontSize: 40, fontWeight: '400' },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    height: 250,
    borderRadius: 125,
    marginBottom: 40,
    borderWidth: 10,
    borderColor: 'gray',
  },
  circle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: { fontSize: 44, fontWeight: '400', color: 'white' },
  button: { borderRadius: 50, padding: 10 },
  buttons: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 10,
  },
});
