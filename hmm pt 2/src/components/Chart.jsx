import { Chart as _Chart, registerables } from "chart.js";
_Chart.register(...registerables);

/** @param {import("chart.js").ChartConfiguration} props */
export function Chart(props) {
  const canvas = <canvas />;
  const chart = new _Chart(canvas, props);
  return canvas;
}