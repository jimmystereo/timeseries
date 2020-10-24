import React, { Fragment } from "react";
import { render } from "react-dom";
import Chart from "./Chart";
import { getData } from "./utils";
import { getData2 } from "./utils";
import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
  componentDidMount() {
    getData().then((data) => {
      this.setState({ data });
    });
  }
  MSFT() {
    getData().then((data) => {
      this.setState({ data });
    });
    console.log("Current");
  }
  TAI() {
    getData2().then((data) => {
      this.setState({ data });
    });
    console.log("Prophet");
  }
  changechart(a) {
    this.setState({ value: a.target.value });
    console.log(a.target.value);
  }
  render() {
    let button1 = (
      <button className="button" onClick={this.MSFT.bind(this)}>
        Current
      </button>
    );
    let button2 = (
      <button className="button" onClick={this.TAI.bind(this)}>
        Prophet
      </button>
    );
    if (this.state == null) {
      return (
        <Fragment>
          <h1>Loading...</h1>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {button1}
          {button2}
          <TypeChooser>
            {(type) => <Chart type={type} data={this.state.data} />}
          </TypeChooser>
        </Fragment>
      );
    }
  }
}

render(<ChartComponent />, document.getElementById("root"));
