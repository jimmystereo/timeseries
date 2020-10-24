import { timeParse } from "d3-time-format";

var promise;

function parseData(parse) {
  return function (k, v) {
    if (k === "date") {
      return parse(v);
    }

    return v;
  };
}
const parseDate = timeParse("%Y-%m-%d");

// const parseDate = timeParse("%Y-%m-%d");

export function getData() {
  promise = fetch("http://127.0.0.1:5000/api/Current", { method: "GET" })
    .then((response) => response.text())
    .then((data) => JSON.parse(data, parseData(parseDate)));

  return promise;
}
export function getData2() {
  promise = fetch("http://127.0.0.1:5000/api/Prophet", { method: "GET" })
    .then((response) => response.text())
    .then((data) => JSON.parse(data, parseData(parseDate)));

  return promise;
}
