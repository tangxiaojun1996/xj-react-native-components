import React from 'react';
import PropTypes from 'prop-types';
import { Platform, Text as NativeText, StyleSheet } from 'react-native';

// 处理Text在某种机型某种字体下宽度被截断的问题
if (Platform.OS !== 'web') {
  const originRender = NativeText.render || NativeText.prototype.render;
  const parent = NativeText.render ? NativeText : NativeText.prototype;
  parent.render = function (...args) {
    const origin = originRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [!Platform.OS === 'ios' && { fontFamily: '' }, origin.props.style],
    });
  };
}

const Text = ({ children, style, ...props }) => (
  <NativeText {...props} style={[styles.text, style]}>{children}</NativeText>
);

Text.propTypes = {
  children: PropTypes.string.isRequired,
  style: NativeText.propTypes.style,
};

Text.defaultProps = {
  style: {},
};

export default Text;

const styles = StyleSheet.create({
  text: {
    backgroundColor: 'transparent',
  },
});
