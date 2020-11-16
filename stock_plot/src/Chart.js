import React, { Fragment } from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
  BarSeries,
  CandlestickSeries,
  BollingerSeries,
  AreaSeries,
  LineSeries,
  MACDSeries,
  RSISeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  EdgeIndicator,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
  OHLCTooltip,
  MovingAverageTooltip,
  MACDTooltip,
  RSITooltip,
  BollingerBandTooltip,
  SingleValueTooltip,
} from "react-stockcharts/lib/tooltip";
import {
  ema,
  macd,
  bollingerBand,
  rsi,
  atr,
} from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import {
  EquidistantChannel,
  DrawingObjectSelector,
} from "react-stockcharts/lib/interactive";
import { last, toObject } from "react-stockcharts/lib/utils";
import { saveInteractiveNodes, getInteractiveNodes } from "./interactiveutils";
var close_color = "#0325ff";
var open_color = "#ffb303";
const macdAppearance = {
  stroke: {
    macd: "#FF0000",
    signal: "#00F300",
  },
  fill: {
    divergence: "#4682B4",
  },
};
const bbStroke = {
  top: "#964B00",
  middle: "#000000",
  bottom: "#964B00",
};

const bbFill = "#4682B4";
class CandleStickChartWithEquidistantChannel extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onDrawComplete = this.onDrawComplete.bind(this);
    this.saveInteractiveNode = this.saveInteractiveNode.bind(this);
    this.saveCanvasNode = this.saveCanvasNode.bind(this);
    this.handleSelection = this.handleSelection.bind(this);

    this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
    this.getInteractiveNodes = getInteractiveNodes.bind(this);

    this.showVol = this.showVol.bind(this);
    this.showEMA = this.showEMA.bind(this);
    this.showBollinger = this.showBollinger.bind(this);
    this.state = {
      enableInteractiveObject: true,
      channels_1: [],
      channels_3: [],
      first: true,
      second: true,
      third: true,
      haveVol: false,
      haveEMA: false,
      haveBollinger: false,
      firstvalue: "0",
      secondvalue: "0",
      thirdvalue: "0",
    };
  }
  saveInteractiveNode(node) {
    this.node = node;
  }
  saveCanvasNode(node) {
    this.canvasNode = node;
  }
  componentDidMount() {
    document.addEventListener("keyup", this.onKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyPress);
  }
  handleSelection(interactives) {
    const state = toObject(interactives, (each) => {
      return [`channels_${each.chartId}`, each.objects];
    });
    this.setState(state);
  }
  onDrawComplete(channels_1) {
    // this gets called on
    // 1. draw complete of drawing object
    // 2. drag complete of drawing object
    this.setState({
      enableInteractiveObject: false,
      channels_1,
    });
  }

  showVol() {
    this.setState({
      haveVol: !this.state.haveVol,
    });
  }
  showEMA() {
    this.setState({
      haveEMA: !this.state.haveEMA,
    });
  }

  showBollinger() {
    this.setState({
      haveBollinger: !this.state.haveBollinger,
    });
  }

  changefichart(a) {
    this.setState({ firstvalue: a.target.value });
  }
  changesechart(a) {
    this.setState({ secondvalue: a.target.value });
  }
  changethchart(a) {
    this.setState({ thirdvalue: a.target.value });
  }
  onKeyPress(e) {
    const keyCode = e.which;
    console.log(keyCode);
    switch (keyCode) {
      case 46: {
        // DEL

        const channels_1 = this.state.channels_1.filter(
          (each) => !each.selected
        );
        const channels_3 = this.state.channels_3.filter(
          (each) => !each.selected
        );

        this.canvasNode.cancelDrag();
        this.setState({
          channels_1,
          channels_3,
        });
        break;
      }
      case 27: {
        // ESC
        this.node.terminate();
        this.canvasNode.cancelDrag();

        this.setState({
          enableInteractiveObject: false,
        });
        break;
      }
      case 68: // D - Draw drawing object
      case 69: {
        // E - Enable drawing object
        this.setState({
          enableInteractiveObject: true,
        });
        break;
      }
    }
  }
  render() {
    const ema26 = ema()
      .id(0)
      .options({ windowSize: 26 })
      .merge((d, c) => {
        d.ema26 = c;
      })
      .accessor((d) => d.ema26);

    const ema12 = ema()
      .id(1)
      .options({ windowSize: 12 })
      .merge((d, c) => {
        d.ema12 = c;
      })
      .accessor((d) => d.ema12);

    const macdCalculator = macd()
      .options({
        fast: 12,
        slow: 26,
        signal: 9,
      })
      .merge((d, c) => {
        d.macd = c;
      })
      .accessor((d) => d.macd);

    const rsiCalculator = rsi()
      .options({ windowSize: 14 })
      .merge((d, c) => {
        d.rsi = c;
      })
      .accessor((d) => d.rsi);

    const atr14 = atr()
      .options({ windowSize: 14 })
      .merge((d, c) => {
        d.atr14 = c;
      })
      .accessor((d) => d.atr14);

    const bb = bollingerBand()
      .merge((d, c) => {
        d.bb = c;
      })
      .accessor((d) => d.bb);

    const { type, data: initialData, width, ratio } = this.props;
    const { channels_1, channels_3 } = this.state;

    const calculatedData = atr14(
      rsiCalculator(macdCalculator(ema12(ema26(bb(initialData)))))
    );
    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => d.date
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      calculatedData
    );
    let tech1;
    let tech2;
    let tech3;
    let MACD = (
      <Fragment>
        <XAxis axisAt="bottom" orient="bottom" showTicks={false} />
        <YAxis axisAt="right" orient="right" ticks={2} />

        <MouseCoordinateX
          at="bottom"
          orient="bottom"
          displayFormat={timeFormat("%Y-%m-%d")}
        />
        <MouseCoordinateY
          at="right"
          orient="right"
          displayFormat={format(".2f")}
        />

        <MACDSeries yAccessor={(d) => d.macd} {...macdAppearance} />
        <MACDTooltip
          origin={[-38, 15]}
          yAccessor={(d) => d.macd}
          options={macdCalculator.options()}
          appearance={macdAppearance}
        />
      </Fragment>
    );

    let RSI = (
      <Fragment>
        <XAxis
          axisAt="bottom"
          orient="bottom"
          outerTickSize={0}
          showTicks={false}
        />
        <YAxis axisAt="right" orient="right" tickValues={[30, 50, 70]} />
        <MouseCoordinateY
          at="right"
          orient="right"
          displayFormat={format(".2f")}
        />
        <MouseCoordinateX
          at="bottom"
          orient="bottom"
          displayFormat={timeFormat("%Y-%m-%d")}
        />
        <RSISeries yAccessor={(d) => d.rsi} />

        <RSITooltip
          origin={[-38, 15]}
          yAccessor={(d) => d.rsi}
          options={rsiCalculator.options()}
        />
      </Fragment>
    );
    let ATR = (
      <Fragment>
        <XAxis axisAt="bottom" orient="bottom" showTicks={false} />
        <YAxis axisAt="right" orient="right" ticks={2} />

        <MouseCoordinateX
          at="bottom"
          orient="bottom"
          displayFormat={timeFormat("%Y-%m-%d")}
        />
        <MouseCoordinateY
          at="right"
          orient="right"
          displayFormat={format(".2f")}
        />

        <LineSeries yAccessor={atr14.accessor()} stroke={atr14.stroke()} />
        <SingleValueTooltip
          yAccessor={atr14.accessor()}
          yLabel={`ATR (${atr14.options().windowSize})`}
          yDisplayFormat={format(".2f")}
          /* valueStroke={atr14.stroke()} - optional prop */
          /* labelStroke="#4682B4" - optional prop */
          origin={[-40, 15]}
        />
      </Fragment>
    );

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];

    if (this.state.firstvalue === "1") {
      tech1 = MACD;
    } else if (this.state.firstvalue === "2") {
      tech1 = RSI;
    } else if (this.state.firstvalue === "3") {
      tech1 = ATR;
    }
    if (this.state.secondvalue === "1") {
      tech2 = MACD;
    } else if (this.state.secondvalue === "2") {
      tech2 = RSI;
    } else if (this.state.secondvalue === "3") {
      tech2 = ATR;
    }
    if (this.state.thirdvalue === "1") {
      tech3 = MACD;
    } else if (this.state.thirdvalue === "2") {
      tech3 = RSI;
    } else if (this.state.thirdvalue === "3") {
      tech3 = ATR;
    }
    return (
      <Fragment>
        <button onClick={this.showBollinger}>BollingerBand</button>
        <button onClick={this.showEMA}>EMA</button>
        <button onClick={this.showVol}>Volume</button>
        <select defaultValue={"0"} onChange={this.changefichart.bind(this)}>
          <option value="0" disabled>
            選擇第一個技術指標
          </option>
          <option value="1">MACD</option>
          <option value="2">RSI</option>
          <option value="3">ATR</option>
        </select>
        <select defaultValue={"0"} onChange={this.changesechart.bind(this)}>
          <option value="0" disabled>
            選擇第二個技術指標
          </option>
          <option value="1">MACD</option>
          <option value="2">RSI</option>
          <option value="3">ATR</option>
        </select>
        <select defaultValue={"0"} onChange={this.changethchart.bind(this)}>
          <option value="0" disabled>
            選擇第三個技術指標
          </option>
          <option value="1">MACD</option>
          <option value="2">RSI</option>
          <option value="3">ATR</option>
        </select>
        <ChartCanvas
          ref={this.saveCanvasNode}
          height={900}
          width={width}
          ratio={ratio}
          margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
          type={type}
          seriesName="MSFT"
          data={data}
          xScale={xScale}
          xAccessor={xAccessor}
          displayXAccessor={displayXAccessor}
          xExtents={xExtents}
        >
          <Chart
            id={1}
            height={400}
            yExtents={[
              (d) => [d.high, d.low],
              ema26.accessor(),
              ema12.accessor(),
            ]}
            padding={{ top: 10, bottom: 20 }}
          >
            <XAxis
              axisAt="bottom"
              orient="bottom"
              showTicks={false}
              outerTickSize={0}
            />
            <YAxis axisAt="right" orient="right" ticks={5} />
            <MouseCoordinateY
              at="right"
              orient="right"
              displayFormat={format(".2f")}
            />

            <CandlestickSeries
              fill={(d) => {
                let date = new Date();
                //if the day is in future, change it's color!
                if (d.date.getTime() > date.getTime()) {
                  //yellow blue
                  return d.close > d.open ? close_color : open_color;
                }
                //green red
                return d.close > d.open ? "#6BA583" : "#FF0000";
              }}
              yAccessor={(d) => {
                return {
                  date: d.date,
                  open: d.open,
                  high: d.high,
                  low: d.low,
                  close: d.close,
                };
              }}
            />

            <EdgeIndicator
              itemType="last"
              orient="right"
              edgeAt="right"
              yAccessor={(d) => d.close}
              fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
            />

            <OHLCTooltip origin={[-40, 0]} />
            <MouseCoordinateX
              at="bottom"
              orient="bottom"
              displayFormat={timeFormat("%Y-%m-%d")}
            />
            {this.state.haveBollinger === true ? (
              <Fragment>
                <BollingerSeries
                  yAccessor={(d) => d.bb}
                  stroke={bbStroke}
                  fill={bbFill}
                />
                <BollingerBandTooltip
                  origin={[-38, 60]}
                  yAccessor={(d) => d.bb}
                  options={bb.options()}
                />
              </Fragment>
            ) : null}
            {this.state.haveEMA === true ? (
              <Fragment>
                <LineSeries
                  yAccessor={ema26.accessor()}
                  stroke={ema26.stroke()}
                />
                <LineSeries
                  yAccessor={ema12.accessor()}
                  stroke={ema12.stroke()}
                />

                <CurrentCoordinate
                  yAccessor={ema26.accessor()}
                  fill={ema26.stroke()}
                />
                <CurrentCoordinate
                  yAccessor={ema12.accessor()}
                  fill={ema12.stroke()}
                />
                <MovingAverageTooltip
                  onClick={(e) => console.log(e)}
                  origin={[-38, 15]}
                  options={[
                    {
                      yAccessor: ema26.accessor(),
                      type: ema26.type(),
                      stroke: ema26.stroke(),
                      windowSize: ema26.options().windowSize,
                    },
                    {
                      yAccessor: ema12.accessor(),
                      type: ema12.type(),
                      stroke: ema12.stroke(),
                      windowSize: ema12.options().windowSize,
                    },
                  ]}
                />
              </Fragment>
            ) : null}

            <EquidistantChannel
              ref={this.saveInteractiveNodes("EquidistantChannel", 1)}
              enabled={this.state.enableInteractiveObject}
              onStart={() => console.log("START")}
              onComplete={this.onDrawComplete}
              channels={channels_1}
            />
          </Chart>
          {this.state.haveVol === true ? (
            <Chart
              id={2}
              height={150}
              yExtents={[(d) => d.volume]}
              origin={(w, h) => [0, h - 600]}
            >
              <YAxis
                axisAt="left"
                orient="left"
                ticks={5}
                tickFormat={format(".2s")}
              />

              <MouseCoordinateY
                at="left"
                orient="left"
                displayFormat={format(".4s")}
              />

              <BarSeries
                yAccessor={(d) => d.volume}
                fill={(d) => {
                  let date = new Date();
                  //if the day is in future, change it's color!
                  if (d.date.getTime() > date.getTime()) {
                    //yellow blue
                    return d.close > d.open ? close_color : open_color;
                  } return d.close > d.open ? "#6BA583" : "#FF0000";
                }}
              />
            </Chart>
          ) : null}
          {this.state.first === true ? (
            <Chart
              id={3}
              height={150}
              yExtents={
                this.state.firstvalue === "1"
                  ? macdCalculator.accessor()
                  : this.state.firstvalue === "2"
                  ? [0, 100]
                  : this.state.firstvalue === "3"
                  ? atr14.accessor()
                  : [0, 100]
              }
              origin={(w, h) => [0, h - 450]}
              padding={{ top: 10, bottom: 10 }}
            >
              {tech1}
            </Chart>
          ) : null}
          {this.state.second === true ? (
            <Chart
              id={4}
              yExtents={
                this.state.secondvalue === "1"
                  ? macdCalculator.accessor()
                  : this.state.secondvalue === "2"
                  ? [0, 100]
                  : this.state.secondvalue === "3"
                  ? atr14.accessor()
                  : [0, 100]
              }
              height={150}
              origin={(w, h) => [0, h - 300]}
            >
              {tech2}
            </Chart>
          ) : null}
          {this.state.third === true ? (
            <Chart
              id={5}
              yExtents={
                this.state.thirdvalue === "1"
                  ? macdCalculator.accessor()
                  : this.state.thirdvalue === "2"
                  ? [0, 100]
                  : this.state.thirdvalue === "3"
                  ? atr14.accessor()
                  : [0, 100]
              }
              height={150}
              origin={(w, h) => [0, h - 150]}
            >
              {tech3}+<XAxis axisAt="bottom" orient="bottom" showTicks={true} />
            </Chart>
          ) : null}

          <CrossHairCursor />
          <DrawingObjectSelector
            enabled={!this.state.enableInteractiveObject}
            getInteractiveNodes={this.getInteractiveNodes}
            drawingObjectMap={{
              EquidistantChannel: "channels",
            }}
            onSelect={this.handleSelection}
          />
        </ChartCanvas>
      </Fragment>
    );
  }
}

CandleStickChartWithEquidistantChannel.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithEquidistantChannel.defaultProps = {
  type: "svg",
};

CandleStickChartWithEquidistantChannel = fitWidth(
  CandleStickChartWithEquidistantChannel
);

export default CandleStickChartWithEquidistantChannel;
