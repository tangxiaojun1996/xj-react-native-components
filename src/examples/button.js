import React, { PureComponent } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Button from '../components/Button';

export default class ButtonExample extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Button style={styles.button} />
          <Button />
        </ScrollView>
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
  button: {
    width: 120,
    height: 60,
    backgroundColor: 'red',
    borderRadius: 5,
    marginBottom: 20,
  },
});
