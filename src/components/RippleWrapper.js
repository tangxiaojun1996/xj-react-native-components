import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  View, StyleSheet, PanResponder, Animated, ViewPropTypes,
} from 'react-native';

const DURATION = 300;
const MARGIN_STYLE = ['margin', 'marginHorizontal', 'marginVertical', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom'];

const RippleWrapper = WrappedComponent => class Wrapper extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    style: ViewPropTypes.style,
  };

  static defaultProps = {
    onPress: () => {},
    style: {},
  };

  constructor(props) {
    super(props);
    this.width = 0;
    this.height = 0;
    this.rippleRadius = 0;
    this.panResponder = this.createPanResponder();
    this.state = {
      rippleTop: 0,
      rippleLeft: 0,
      touching: false,
      finished: true,
      opacity: new Animated.Value(0),
      rippleScale: new Animated.Value(0),
    };
  }

    createPanResponder = () => PanResponder.create({
      // 要求成为响应者：
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        const { locationX: left, locationY: top } = evt.nativeEvent;
        this.setState(
          {
            touching: true,
            finished: false,
            rippleTop: top - this.rippleRadius,
            rippleLeft: left - this.rippleRadius,
          },
          this.rippleStart,
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        // 最近一次的移动距离为gestureState.move{X,Y}
        // 从成为响应者开始时的累计手势移动距离为gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
        // 一般来说这意味着一个手势操作已经成功完成。
        const { onPress } = this.props;
        const { locationX, locationY } = evt.nativeEvent;
        this.rippleEnd();
        if (
          locationX <= this.width
            && locationY <= this.height
            && typeof onPress === 'function'
        ) {
          onPress(evt, gestureState);
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
        this.rippleEnd();
      },
      // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
      // 默认返回true。目前暂时只支持android。
      onShouldBlockNativeResponder: (evt, gestureState) => false,
    });

    onLayout = e => {
      const { layout } = e.nativeEvent;
      const { width, height } = layout;

      this.width = width;
      this.height = height;
      this.rippleRadius = Math.sqrt(width ** 2 + height ** 2);
    };

    rippleStart = () => {
      const { opacity, rippleScale } = this.state;

      opacity.setValue(0);
      rippleScale.setValue(0);

      Animated.timing(rippleScale, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        this.setState({ finished: true });
        const { touching } = this.state;
        if (!touching && finished) rippleScale.setValue(0);
      });
    };

    rippleEnd = () => {
      const { finished, rippleScale } = this.state;

      this.setState({ touching: false });
      if (finished) rippleScale.setValue(0);
    };

    render() {
      const { rippleTop, rippleLeft, rippleScale } = this.state;
      const { style } = this.props;

      const flattenedStyle = StyleSheet.flatten(style);
      const marginStyle = _.pick(flattenedStyle, MARGIN_STYLE);
      const omitMarginStyle = _.omit(flattenedStyle, MARGIN_STYLE);
      const rippleStyle = [
        styles.ripple,
        {
          height: 2 * this.rippleRadius,
          width: 2 * this.rippleRadius,
          transform: [{ scale: rippleScale }],
          borderRadius: this.rippleRadius,
          top: rippleTop,
          left: rippleLeft,
        },
      ];

      return (
        <View
          style={[styles.container, marginStyle]}
          onLayout={this.onLayout}
          {...this.panResponder.panHandlers}
        >
          <Animated.View pointerEvents="none" style={rippleStyle} />
          <WrappedComponent {...this.props} style={omitMarginStyle} />
        </View>
      );
    }
};

export default RippleWrapper;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 999,
  },
});
