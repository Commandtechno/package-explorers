const GRID_COLOR = "rgba(255,255,255,0.1)";

import { Chart as CreateChart, registerables } from "chart.js";
CreateChart.register(...registerables);

/** @param {import("chart.js").ChartConfiguration & { title: string }} props */
export function Chart(props) {
  props.options = {
    ...props?.options,
    maintainAspectRatio: false,
    plugins: {
      ...props?.options?.plugins,
      legend: { ...props?.options?.plugins?.legend, display: false },
      title: {
        ...props?.options?.plugins?.title,
        display: true,
        color: "white",
        font: {
          ...props?.options?.plugins?.title?.font,
          size: 24
        },
        text: props.title
      }
    },
    scales: {
      ...props?.options?.scales,
      x: {
        ...props?.options?.scales?.x,
        grid: { ...props?.options?.scales?.x?.grid, color: GRID_COLOR, borderColor: GRID_COLOR }
      },
      y: {
        ...props?.options?.scales?.y,
        grid: { ...props?.options?.scales?.x?.grid, color: GRID_COLOR, borderColor: GRID_COLOR }
      }
    }
  };

  const canvas = <canvas />;
  new CreateChart(canvas, props);
  return canvas;
}