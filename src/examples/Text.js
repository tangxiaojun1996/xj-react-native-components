import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../components/Text';

export default class ButtonExample extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <Text style={{ backgroundColor: 'yellow' }}>1234567890</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red' }}>Hello World!</Text>
        <Text>你好！</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
