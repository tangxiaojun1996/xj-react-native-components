import React from 'react';
import PropTypes, { string } from 'prop-types';
import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
} from 'react-native';
import { DECELERATION } from './config';

export default class TabContent extends React.Component {
	static propTypes = {
	  children: PropTypes.node.isRequired,
	  defaultPageKey: string,
	};

	static defaultProps = {
	  defaultPageKey: undefined,
	};

	constructor(props) {
	  super(props);
	  this.panResponder = this._createPanResponder();
	  this.pageIndex = 0;
	  this.scrollX = 0;
	  this.scrollXAnimValue = 0;
	  this.state = {
	    width: 0,
	    height: 0,
	    scrollX: new Animated.Value(0),
	    pageIndexKeyMap: this._getPageIndexKeyMap(props.children),
	    // eslint-disable-next-line max-len
	    pageLoadKeyMap: this._getPageKeyMap(props, [props.defaultPageKey || this._getPageKeyByIndex(0)]),
	  };
	}

	componentDidMount() {
	  const { scrollX } = this.state;

	  scrollX.addListener(({ value }) => {
	    this.scrollXAnimValue = value;
	  });
	}

	_getPageKeyByIndex = pageIndex => {
	  const { children } = this.props;
	  const childrenArray = React.Children.map(children, c => c.key);
	  return childrenArray[pageIndex];
	}

	_getPageIndexByKey = key => {
	  const { children } = this.props;
	  const index = React.Children.map(children, c => c.key).findIndex(k => k === key);
	  return index > -1 ? index : 0;
	}

	_getChildrenKeyMap = children => React.Children
	  .map(children, c => c.key)
	  .reduce((r, k) => ({ ...r, [k]: false }), {})

	_getPageIndexKeyMap = children => React.Children
	  .map(children, c => c.key)
	  .reduce((r, k, idx) => ({ ...r, [idx]: k }), {})

	_getPageKeyMap = (props, activeKeys) => {
	  const { children } = props;
	  const activeKeysMap = activeKeys.reduce((r, key) => ({ ...r, [`${key}`]: true }), {});
	  const childrenKeyMap = this._getChildrenKeyMap(children);
	  return Object.keys(childrenKeyMap).reduce((r, k) => ({ ...r, [k]: !!activeKeysMap[k] }), {});
	}

	onContainerLayout = e => {
	  const { scrollX } = this.state;
	  const { defaultPageKey } = this.props;
	  const { width, height } = e.nativeEvent.layout;
	  const defaultScrollX = -this._getPageIndexByKey(defaultPageKey) * width;

	  scrollX.setValue(defaultScrollX);
	  this.setState({ width, height });
	}

  _createPanResponder = () => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: this._isHorizontalSwipe, // move时触发一次, 判断为水平滚动情况才响应
    onMoveShouldSetPanResponderCapture: this._isHorizontalSwipe, // move时触发一次, 判断为水平滚动情况才响应
    onPanResponderGrant: this.handleStart,
    onPanResponderMove: this.handleMove,
    onPanResponderTerminationRequest: () => false, // 上层的responder是否能中断当前的responder
    onPanResponderRelease: this.handleRelease,
    onPanResponderTerminate: this.handleRelease,
    onShouldBlockNativeResponder: (e, g) => false, // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者 | 默认返回true。目前暂时只支持android。
  });

	_isHorizontalSwipe = (e, { dx, dy }) => Math.abs(dx) > Math.abs(dy * 3);

	handleStart = () => {
	  const { scrollX } = this.state;
	  scrollX.stopAnimation();
	  this.scrollX = this.scrollXAnimValue;
	}

	handleMove= (e, { dx }) => {
	  const scrollX = this._getInRangeScrollX(this.scrollX + dx);
	  this.moveTo(scrollX);
	}

	handleRelease = (e, g) => {
	  const { width } = this.state;
	  const { dx, vx } = g;
	  const newScrollX = this._getEffectScrollX(this.scrollX + dx);
	  const newIndex = this._getPageIndex(-newScrollX);
	  if (newIndex !== this.pageIndex) { // 滚动到另外一屏了
	    this.pageIndex = newIndex;
	  } else if (vx < -DECELERATION && this.pageIndex !== this.childrenSum - 1) { // 达到滚动到下一屏的速度
	    this.pageIndex += 1;
	  } else if (vx > DECELERATION && this.pageIndex !== 0) { // 达到滚动到上一屏的速度
	    this.pageIndex -= 1;
	  }

	  this.scrollX = -this.pageIndex * width;
	  this.scrollToIndex(this.pageIndex);

	  this.loadPages(this.pageIndex);
	}

	loadPages = pageIndex => {
	  const { pageIndexKeyMap, pageLoadKeyMap } = this.state;
	  const newActivePageKey = pageIndexKeyMap[pageIndex];
	  const newPageLoadKeyMap = { ...pageLoadKeyMap, [newActivePageKey]: true };
	  this.setState({ pageLoadKeyMap: newPageLoadKeyMap });
	}

	// 获取子节点数量
	get childrenSum() {
	  const { children } = this.props;
	  return React.Children.toArray(children).length;
	}

	// 获取所有tabs的宽度之和
	get widthCount() {
	  const { width } = this.state;
	  return (this.childrenSum - 1) * width; // 可滚动的是(n - 1)屏
	}

	// 获取当前页面所处位置
	_getPageIndex = scrollX => {
	  const { width } = this.state;
	  const indexCount = this.childrenSum - 1;
	  const index = Math.round(scrollX / width);
	  return index > indexCount ? indexCount : index < 0 ? 0 : index;
	}

	// 获取在滚动范围内的偏移量(防止超出最前和最后一个)
	// eslint-disable-next-line max-len
	_getInRangeScrollX = scrollX => (scrollX < -this.widthCount ? -this.widthCount : scrollX > 0 ? 0 : scrollX)

	// 获取有效展示的偏移量(必定是每屏宽度的倍数)
	_getEffectScrollX = scrollX => {
	  const { width } = this.state;
	  const _scrollX = this._getInRangeScrollX(scrollX);
	  return Math.round(_scrollX / width) * width;
	}

	moveTo = scrollX => {
	  // eslint-disable-next-line react/destructuring-assignment
	  this.state.scrollX.setValue(scrollX);
	}

	scrollToIndex = pageIndex => {
	  const { scrollX, width } = this.state;
	  Animated.timing(scrollX, {
	    toValue: -pageIndex * width,
	    duration: 250,
	    useNativeDriver: true,
	  }).start();
	}

	render() {
	  const {
	    width, height, scrollX, pageLoadKeyMap,
	  } = this.state;
	  const { children } = this.props;
	  const contentDimensions = { width, height };

	  return (
  <View onLayout={this.onContainerLayout} style={styles.container}>

    {!!width && !!height && (
    <Animated.View
      {...this.panResponder.panHandlers}
      style={[styles.content, contentDimensions, { transform: [{ translateX: scrollX }] }]}
    >
      {React.Children.map(children, child => (
        <View key={child.key} style={contentDimensions}>
          {pageLoadKeyMap[child.key] ? child : null}
        </View>
      ))}
    </Animated.View>
    )}
  </View>
	  );
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  content: {
    flexDirection: 'row',
  },
});
