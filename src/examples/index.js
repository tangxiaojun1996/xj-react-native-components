import * as React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Routes from './routes';
import { RatioUtils } from '../utils';

const { convertX: cx } = RatioUtils;

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const renderItem = routeProps => (
    <TouchableOpacity
      key={routeProps.name}
      style={styles.item}
      onPress={() => navigation.push(routeProps.name)}
    >
      <Text style={styles.text}>{routeProps.name}</Text>
    </TouchableOpacity>
  );

  return <View style={styles.root}>{Routes.map(renderItem)}</View>;
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        {Routes.map(route => (
          <Stack.Screen
            key={route.name}
            name={route.name}
            component={route.component}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: cx(15),
  },
  item: {
    alignSelf: 'stretch',
    height: cx(80),
    borderRadius: cx(12),
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: cx(16),
    marginBottom: cx(12),
  },
  text: {
    fontSize: cx(18),
    color: '#333',
    fontWeight: 'bold',
  },
});
