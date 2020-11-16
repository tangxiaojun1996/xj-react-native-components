# PercentBar 可触控调节的柱状组件

## 参数

| 属性            | 说明                  | 类型      | 默认值  | 必传 |
| --------------- | --------------------- | --------- | ------- | ---- |
| disabled        | 是否禁用              | boolean   | false   | 否   |
| barColor        | bar 的颜色            | string    | #008dff | 否   |
| horizontal      | 是否水平显示          | boolean   | false   | 否   |
| value           | 值                    | number    | 0       | 否   |
| stepValue       | 每次调整的最小值      | number    | 10      | 否   |
| maximumValue    | 最大值                | number    | 100     | 否   |
| minimumValue    | 最小值                | number    | 0       | 否   |
| onChange        | 调整 bar 时的回调     | Function  | ()=>{}  | 否   |
| onTouchComplete | 调整 bar 结束时的回调 | Function  | ()=>{}  | 否   |
| style           | bar 的容器样式        | ViewStyle | {}      | 否   |
| textStyle       | 百分比文字的样式      | TextStyle | {}      | 否   |
| showPercent       | 是否显示百分比文字      | boolean | true      | 否   |

