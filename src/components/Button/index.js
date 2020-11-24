import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, StyleSheet, ViewPropTypes,
} from 'react-native';

import RippleWrapper from '../RippleWrapper';

class Button extends PureComponent {
  render() {
    const { text, style, textStyle } = this.props;

    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </View>
    );
  }
}

Button.propTypes = {
  text: PropTypes.string,
  style: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  onPress: PropTypes.func,
};

Button.defaultProps = {
  text: 'Button',
  style: {},
  textStyle: {},
  onPress: () => {},
};

export default RippleWrapper(Button);

const styles = StyleSheet.create({
  container: {
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: '#1890ff',
  },
  text: {
    fontSize: 14,
    color: '#fff',
  },
});
