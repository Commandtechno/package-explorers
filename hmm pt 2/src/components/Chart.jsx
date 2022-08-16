const GRID_COLOR = "rgba(255,255,255,0.1)";

import { Chart as CreateChart, registerables } from "chart.js";
CreateChart.register(...registerables);

/** @param {import("chart.js").ChartConfiguration} props */
export function Chart(props) {
  props.options = {
    scales: {
      x: { grid: { color: GRID_COLOR, borderColor: GRID_COLOR } },
      y: { grid: { color: GRID_COLOR, borderColor: GRID_COLOR } }
    },
    maintainAspectRatio: false
  };

  const canvas = <canvas />;
  new CreateChart(canvas, props);
  return canvas;
}