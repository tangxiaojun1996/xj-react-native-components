import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import RippleWrapper from '../../src/components/RippleWrapper';

const MyComponent = () => <View style={styles.view} />;

const WrappedComponent = RippleWrapper(MyComponent);

export default class RippleWrapperExample extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <WrappedComponent />
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
  view: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
