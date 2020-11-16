import React, { PureComponent } from 'react';
import { ViewStyle, TextStyle } from 'react-native';

interface Props {
  disabled?: boolean;
  barColor?: string;
  horizontal?: boolean;
  value?: number;
  stepValue?: number;
  maximumValue?: number;
  minimumValue?: number;
  onChange?: (value: number) => void;
  onTouchComplete?: (value: number) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showPercent?: boolean;
}

export default class PercentBar extends PureComponent<Props> {}
