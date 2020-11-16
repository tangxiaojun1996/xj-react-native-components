import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  StyleSheet,
  Animated,
  Text as NativeText,
  View,
  ViewPropTypes,
  PanResponder,
  Easing,
} from 'react-native';
import Text from '../Text';

const THROTTLE_TIME = 200;

export default class PercentBar extends Component {
  static propTypes = {
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * bar 的颜色
     */
    barColor: PropTypes.string,
    /**
     * 是否水平
     */
    horizontal: PropTypes.bool,
    /**
     * 值
     */
    value: PropTypes.number,
    /**
     * 每次调整的最小值
     */
    stepValue: PropTypes.number,
    /**
     * 最大值
     */
    maximumValue: PropTypes.number,
    /**
     * 最小值
     */
    minimumValue: PropTypes.number,
    /**
     * 调整时的回调
     */
    onChange: PropTypes.func,
    /**
     * 调整结束时的回调
     */
    onTouchComplete: PropTypes.func,
    /**
     * 容器样式
     */
    style: ViewPropTypes.style,
    /**
     * 百分比文字的样式
     */
    textStyle: NativeText.propTypes.style,
    /**
     * 是否显示百分比文本
     */
    showPercent: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    barColor: '#008dff',
    horizontal: false,
    value: 0,
    stepValue: 10,
    maximumValue: 100,
    minimumValue: 0,
    onChange: () => {},
    onTouchComplete: () => {},
    style: {},
    textStyle: {},
    showPercent: true,
  };

  constructor(props) {
    super(props);
    this.value = props.value;
    this.textHeight = 0;
    this.textWidth = 0;
    this.touching = false;
    this.maxValueExtent = 0; // 可调宽度
    this.stepExtent = 0; // 每一步的宽度
    this.valueExtentWhileTouchStart = null;
    this.panResponder = this.createPanResponser();
    this.state = {
      percent: 0,
      effectiveValueExtent: 0,
      valueDisplayExtent: new Animated.Value(0),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    const { stepValue } = this.props;
    // 不在手动调整的时候才接受props
    if (value !== this.value && !this.touching) {
      const valueExtent = (this.stepExtent * value) / stepValue;
      const effectiveExtent = this.getEffectiveExtent(valueExtent);
      this.changeBarExtentWithAnimate(effectiveExtent);
    }
  }

  // 获取初始宽高, 初始化数值
  onContainerLayout = e => {
    const {
      stepValue, horizontal, value, maximumValue, minimumValue,
    } = this.props;
    this.maxValueExtent = _.get(e, ['nativeEvent', 'layout', horizontal ? 'width' : 'height'], 0);
    this.stepExtent = stepValue * (this.maxValueExtent / (maximumValue - minimumValue));
    const valueExtent = this.stepExtent * ((value - minimumValue) / stepValue);
    const valueDisplayExtent = this.getEffectiveExtent(valueExtent);

    this.setState({ valueDisplayExtent: new Animated.Value(valueDisplayExtent) }, () => {
      this.changeBarExtentWithAnimate(valueDisplayExtent);
    });
  };

  // 获取将会实际显示的bar的长度
  getEffectiveExtent = valueExtent => Math.round(valueExtent / this.stepExtent) * this.stepExtent;

  // 获取bar对应的value
  getValue = effectiveExtent => {
    const { maximumValue, minimumValue } = this.props;
    return Math.round(
      (effectiveExtent / this.maxValueExtent) * (maximumValue - minimumValue) + minimumValue,
    );
  };

  // 获取text宽高
  textOnLayout = e => {
    this.textHeight = _.get(e, ['nativeEvent', 'layout', 'height'], 0);
    this.textWidth = _.get(e, ['nativeEvent', 'layout', 'width'], 0);
  };

  createPanResponser = () => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderStart: (e, g) => {
      const { horizontal } = this.props;
      const { locationX, locationY } = e.nativeEvent;
      this.touching = true;
      this.valueExtentWhileTouchStart = this.getEffectiveExtent(
        horizontal ? locationX : this.maxValueExtent - locationY,
      );
      this.handleBarMove(e, g);
    },
    onPanResponderMove: this.handleBarMove,
    onPanResponderRelease: (e, g) => {
      const { onTouchComplete } = this.props;
      if (onTouchComplete === 'function') {
        onTouchComplete(this.value);
      }
      this.valueExtentWhileTouchStart = null;
      // 加上节流的时间, 避免松手后在节流时间内value改变使得显示跳动
      setTimeout(() => {
        this.touching = false;
      }, THROTTLE_TIME);
    },
  });

  handleBarMove = (e, g) => {
    const { effectiveValueExtent: beforeTouchStartValueExtent } = this.state;
    const { horizontal } = this.props;
    const { dx, dy } = g;
    // 开始移动的高度 + (-dy)得到实时高度
    const valueExtent = this.getEffectiveExtent(
      this.valueExtentWhileTouchStart + (horizontal ? dx : -dy),
    );
    // eslint-disable-next-line max-len
    const effectiveValueExtent = valueExtent > this.maxValueExtent ? this.maxValueExtent : valueExtent < 0 ? 0 : valueExtent;
    if (effectiveValueExtent !== beforeTouchStartValueExtent) {
      this.changeBarExtentWithAnimate(effectiveValueExtent);
      this.throttledTriggerOnChange(effectiveValueExtent);
      this.value = this.getValue(effectiveValueExtent);
    }
  };

  // 执行动画来改变bar的高度
  changeBarExtentWithAnimate = effectiveValueExtent => {
    const { percent: statePercent, valueDisplayExtent } = this.state;
    // eslint-disable-next-line max-len
    const percent = this.maxValueExtent > 0 ? Math.round((effectiveValueExtent * 100) / this.maxValueExtent) : 0;
    if (percent !== statePercent) {
      Animated.timing(valueDisplayExtent, {
        toValue: effectiveValueExtent,
        duration: 40,
        easing: Easing.linear,
      }).start();

      this.setState({ percent, effectiveValueExtent });
    }
  };

  throttledTriggerOnChange = _.throttle(effectiveValueExtent => {
    const { onChange } = this.props;
    const value = this.getValue(effectiveValueExtent);
    onChange && onChange(value);
  }, THROTTLE_TIME);

  renderPercentText = () => {
    const { percent } = this.state;
    const { textStyle } = this.props;

    return (
      <View pointerEvents="none">
        <Text numberOfLines={1} onLayout={this.textOnLayout} style={[styles.percent, textStyle]}>
          {`${percent}%`}
        </Text>
      </View>
    );
  };

  render() {
    const { valueDisplayExtent, effectiveValueExtent } = this.state;
    const {
      barColor,
      style,
      disabled,
      horizontal,
      maximumValue,
      minimumValue,
      stepValue,
      showPercent,
    } = this.props;

    const showVerticalText = showPercent && !horizontal && effectiveValueExtent < this.textHeight;
    const showHorizontalText = showPercent && horizontal && effectiveValueExtent < this.textWidth;
    // eslint-disable-next-line max-len
    const showInnerText = showPercent && effectiveValueExtent >= (horizontal ? this.textWidth : this.textHeight);

    const containerStyle = [horizontal ? styles.horizontal : styles.vertical, style];
    const barStyle = [
      styles.bar,
      {
        height: horizontal ? '100%' : valueDisplayExtent,
        width: horizontal ? valueDisplayExtent : '100%',
        backgroundColor: barColor,
      },
    ];

    return (
      <View
        {...this.panResponder.panHandlers}
        key={`${maximumValue}_${minimumValue}_${stepValue}`} // 涉及渲染的props作为key, 修改后触发onLayout重新计算
        style={containerStyle}
        onLayout={this.onContainerLayout}
        pointerEvents={disabled ? 'none' : 'auto'}
      >
        {/* 兼容Android的子元素不能显示在父元素外的问题 */}
        {showVerticalText && this.renderPercentText()}

        <Animated.View pointerEvents="none" style={barStyle}>
          {showInnerText && this.renderPercentText()}
        </Animated.View>

        {showHorizontalText && this.renderPercentText()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  horizontal: {
    height: 50,
    width: 200,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  vertical: {
    height: 200,
    width: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percent: {
    lineHeight: 24,
    fontSize: 16,
    color: '#B9BCB9',
  },
});
