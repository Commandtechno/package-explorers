import { ChartConfiguration } from "chart.js";

const test: ChartConfiguration = {
  type: "bar",
  title: "Videos per month",
  data: {
    labels: [
      "2020-04",
      "2020-05",
      "2020-06",
      "2020-07",
      "2020-08",
      "2020-09",
      "2020-10",
      "2020-11",
      "2020-12",
      "2021-01",
      "2021-02",
      "2021-03",
      "2021-04",
      "2021-05",
      "2021-06",
      "2021-07",
      "2021-08",
      "2021-09"
    ],
    datasets: [
      {
        data: [
          3502,
          6373,
          6436,
          8765,
          6976,
          10609,
          8916,
          6781,
          7850,
          8948,
          8700,
          6336,
          null,
          null,
          null,
          null,
          null,
          null
        ],
        backgroundColor: "#5865F2"
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        color: "white",
        font: {
          size: 24
        },
        text: "Videos per month"
      }
    },
    scales: {
      x: {
        axis: "x",
        grid: {
          color: "rgba(255,255,255,0.1)",
          borderColor: "rgba(255,255,255,0.1)",
          offset: true,
          display: true,
          lineWidth: 1,
          drawBorder: true,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 8,
          borderDash: [],
          borderDashOffset: 0,
          borderWidth: 1
        },
        type: "category",
        offset: true,
        ticks: {
          minRotation: 0,
          maxRotation: 50,
          mirror: false,
          textStrokeWidth: 0,
          textStrokeColor: "",
          padding: 3,
          display: true,
          autoSkip: true,
          autoSkipPadding: 3,
          labelOffset: 0,
          minor: {},
          major: {},
          align: "center",
          crossAlign: "near",
          showLabelBackdrop: false,
          backdropColor: "rgba(255, 255, 255, 0.75)",
          backdropPadding: 2,
          color: "#666"
        },
        display: true,
        reverse: false,
        beginAtZero: false,
        bounds: "ticks",
        grace: 0,
        title: {
          display: false,
          text: "",
          padding: {
            top: 4,
            bottom: 4
          },
          color: "#666"
        },
        id: "x",
        position: "bottom"
      },
      y: {
        axis: "y",
        grid: {
          color: "rgba(255,255,255,0.1)",
          borderColor: "rgba(255,255,255,0.1)",
          display: true,
          lineWidth: 1,
          drawBorder: true,
          drawOnChartArea: true,
          drawTicks: true,
          tickLength: 8,
          offset: false,
          borderDash: [],
          borderDashOffset: 0,
          borderWidth: 1
        },
        type: "linear",
        beginAtZero: true,
        ticks: {
          minRotation: 0,
          maxRotation: 50,
          mirror: false,
          textStrokeWidth: 0,
          textStrokeColor: "",
          padding: 3,
          display: true,
          autoSkip: true,
          autoSkipPadding: 3,
          labelOffset: 0,
          minor: {},
          major: {},
          align: "center",
          crossAlign: "near",
          showLabelBackdrop: false,
          backdropColor: "rgba(255, 255, 255, 0.75)",
          backdropPadding: 2,
          color: "#666"
        },
        display: true,
        offset: false,
        reverse: false,
        bounds: "ticks",
        grace: 0,
        title: {
          display: false,
          text: "",
          padding: {
            top: 4,
            bottom: 4
          },
          color: "#666"
        },
        id: "y",
        position: "left"
      }
    }
  }
};