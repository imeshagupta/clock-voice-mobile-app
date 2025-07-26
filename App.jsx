import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Alarm from './src/screens/Alarm';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import WorldClock from './src/screens/WorldClock';
import Stopwatch from './src/screens/Stopwatch';
import Timer from './src/screens/Timer';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'black' },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Alarm"
        component={Alarm}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="alarm" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WorldClock"
        component={WorldClock}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Stopwatch"
        component={Stopwatch}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="stopwatch" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Timer"
        component={Timer}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="timer-sand"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
const App = () => {
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
