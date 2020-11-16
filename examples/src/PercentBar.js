import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import PercentBar from '../../src/components/PercentBar';

export default class PercentBarExample extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <PercentBar value={30} />
        <PercentBar
          value={500}
          barColor="#fff"
          maximumValue={1000}
          style={{ borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.2)' }}
          showPercent={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#333',
  },

});
