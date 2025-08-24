- ```
  indicator
  ```

   

  指标配置，可以是指标名，也可以是一个对象。对象参数如下。

  - `name` 名称。

  - `id` 指标 id 。

  - `shortName` 简短名称，用于提示显示。

  - `precision` 精度。

  - `calcParams` 计算参数。

  - `shouldOhlc` 是否需要显示 `ohlc` 柱。

  - `shouldFormatBigNumber` 是否需要将大数字格式化显示。

  - `visible` 是否可见。

  - `zLevel` 层级，只作用于指标与指标之间。

  - `extendData` 自定义扩展数据。

  - `series` 系列，支持 `normal` ， `price` 和 `volume` ，当是 `price` 并且没有设置 `precision` 时，精度将随着价格精度变化，当是 `volume` 并且没有设置 `precision` 时，精度将随数量精度变化。

  - ```
    figures
    ```

     

    图形配置，是一个数组，子项是包含配置的

     

    ```
    object
    ```

     

    。

    - `key` 数据取值的标识，与 `calc` 返回的数据子项的 `key` 对应。
    - `type` 图形类型，支持 `klinecharts.getSupportedFigures` 返回值存在的类型。
    - `baseValue` 基本对照值，目前仅仅作用于 `type` 是 `rect` 和 `bar` 的时候，当此值有效时，图形将会以此值为基准上下绘制。
    - `attrs` 属性值，是一个方法，返回值是 `klinecharts.getFigureClass` 得到的对象所需要的属性。
    - `styles` 样式，是一个方法，返回值是 `klinecharts.getFigureClass` 得到的对象所需要的样式。

  - `minValue` 指定最小值。

  - `maxValue` 指定最大值。

  - `styles` 样式配置，类型同通用样式 `Styles` 中的 `indicator` 。

  - `shouldUpdate` 手动控制是否需要更新。

  - `calc` 计算方法。

  - `regenerateFigures` 重新生成基础图形配置，当 `calcParams` 变化时触发，返回值类型同 `figures` 。

  - `createTooltipDataSource` 创建自定义的提示信息。

  - `draw` 自定义绘制方法，如果返回值是 `true` ，则会覆盖默认的绘制。

  - `onDataStateChange` 数据变化回调通知。

- `isStack` 是否叠加。

- ```
  paneOptions
  ```

   

  窗口配置。

  - `id` 窗口id。

  - `height` 高度。

  - `minHeight` 最小高度。

  - `dragEnabled` 是否可以拖拽调整高度。

  - `order` 顺序。

  - `state` 状态，支持 `normal` ， `maximize` 和 `minimize` 。

  - ```
    axis
    ```

     

    坐标轴配置。

    - `name` 坐标轴名称。

    - `reverse` 是否反向。

    - `inside` 是否在内部。

    - `position` 位置，支持 `left` 和 `right` 。

    - `scrollZoomEnabled` 是否允许滚动缩放。

    - ```
      gap
      ```

       

      上下边距配置。

      - `top` 上边距。
      - `bottom` 下边距。

    - `createRange` 创建轴上取值范围回调方法。

    - `createTicks` 创建分割信息回调方法。



    内置技术指标
指标名	默认计算参数	指标名	默认计算参数	指标名	默认计算参数
MA	[5, 10, 30, 60]	BIAS	[6, 12, 24]	VR	[24, 30]
EMA	[6, 12, 20]	BRAR	[26]	WR	[6, 10, 14]
SMA	[12, 2]	CCI	[13]	MTM	[6, 10]
BBI	[3, 6, 12, 24]	DMI	[14, 6]	EMV	[14, 9]
VOL	[5, 10, 20]	CR	[26, 10, 20, 40, 60]	SAR	[2, 2,  20]
MACD	[12, 26, 9]	PSY	[12, 6]	AO	[5, 34]
BOLL	[20, 2]	DMA	[10, 50, 10]	ROC	[12, 6]
KDJ	[9, 3, 3]	TRIX	[12, 20]	PVT	无
RSI	[6, 12, 24]	OBV	[30]	AVP	无

提示

一些指标可以使用 chart.createIndicator('MA', true, { id:'candle_pane' }) 叠加在蜡烛图上，而有些则不能。与蜡烛图兼容的指标有：BBI、BOLL、EMA、MA、SAR、SMA。另外也可以使用自定义指标的自定义绘制，将指标绘制在蜡烛图上，使其能够和蜡烛图兼容。