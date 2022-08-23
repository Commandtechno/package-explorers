import ApexCharts, { ApexOptions } from "apexcharts";

/** @param {ApexOptions} options */
export function Test(options) {
  const chart = <div></div>;
  new ApexCharts(chart, options).render();
  return chart;
}