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
	  maxLoadPage: PropTypes.number,
	};

	static defaultProps = {
	  defaultPageKey: undefined,
	  maxLoadPage: undefined,
	};

	constructor(props) {
	  super(props);
	  const defaultPageKey = this._getPageIndexByKey(props.defaultPageKey) > -1
	    ? props.defaultPageKey
	    : this._getPageKeyByIndex(0);

	  this.pageIndex = 0;
	  this.scrollX = 0;
	  this.scrollXAnimValue = 0;
	  this.renderedPageKeyQueue = [defaultPageKey];
	  this.panResponder = this.createPanResponder();
	  this.state = {
	    width: 0,
	    height: 0,
	    scrollX: new Animated.Value(0),
	    pageLoadKeyMap: { [defaultPageKey]: true },
	  };
	}

	componentDidMount() {
	  const { scrollX } = this.state;

	  scrollX.addListener(({ value }) => {
	    this.scrollXAnimValue = value;
	  });
	}

	onContainerLayout = e => {
	  const { scrollX } = this.state;
	  const { defaultPageKey } = this.props;
	  const { width, height } = e.nativeEvent.layout;
	  const defaultScrollX = -this._getPageIndexByKey(defaultPageKey) * width;

	  scrollX.setValue(defaultScrollX);
	  this.setState({ width, height });
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

	// 获取当前页面所处index
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

	// key找index
	_getPageKeyByIndex = pageIndex => {
	  const { children } = this.props;
	  const childrenKeys = React.Children.map(children, c => c.key);
	  return childrenKeys[pageIndex];
	}

	// index找key
	_getPageIndexByKey = key => {
	  const { children } = this.props;
	  return React.Children.map(children, c => c.key).findIndex(k => k === key);
	}

	// 创建手势
  createPanResponder = () => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: this.isHorizontalSwipe, // move时触发一次, 判断为水平滚动情况才响应
    onMoveShouldSetPanResponderCapture: this.isHorizontalSwipe, // move时触发一次, 判断为水平滚动情况才响应
    onPanResponderGrant: this.handleStart,
    onPanResponderMove: this.handleMove,
    onPanResponderTerminationRequest: () => false, // 上层的responder是否能中断当前的responder
    onPanResponderRelease: this.handleRelease,
    onPanResponderTerminate: this.handleRelease,
    onShouldBlockNativeResponder: (e, g) => false, // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者 | 默认返回true。目前暂时只支持android。
  });

	isHorizontalSwipe = (e, { dx, dy }) => Math.abs(dx) > Math.abs(dy * 3);

	handleStart = () => {
	  const { scrollX } = this.state;

	  scrollX.stopAnimation();
	  this.scrollX = this.scrollXAnimValue;
	}

	handleMove= (e, { dx }) => {
	  const newScrollX = this._getInRangeScrollX(this.scrollX + dx);
	  // eslint-disable-next-line react/destructuring-assignment
	  this.state.scrollX.setValue(newScrollX);
	}

	handleRelease = (e, { dx, vx }) => {
	  const { width } = this.state;
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

	  this.updateRenderedPageKey(this.pageIndex); // 更新加载的页面
	  this.scrollToIndex(this.pageIndex); // 滚动到对应页面
	}

	updateRenderedPageKey = pageIndex => {
	  const { maxLoadPage } = this.props;
	  const pageKey = this._getPageKeyByIndex(pageIndex);

	  if (!this.renderedPageKeyQueue.includes(pageKey)) { // 最近没加载过的页面, 推入队列
	    this.renderedPageKeyQueue.push(pageKey);
	    if (maxLoadPage > 0 && this.renderedPageKeyQueue.length > maxLoadPage) { // 加载超出上限, 最先加载的出队
	      this.renderedPageKeyQueue.shift();
	    }
	  }
	  const pageLoadKeyMap = this.renderedPageKeyQueue.reduce((r, k) => ({ ...r, [k]: true }), {});

	  this.setState({ pageLoadKeyMap });
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
