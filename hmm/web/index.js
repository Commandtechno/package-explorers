const charts = new Set();

const isDarkTheme = localStorage.getItem("darkTheme") === "true";
const theme = isDarkTheme
  ? {
      grid: "rgba(255,255,255,0.1)",
      data: "rgba(255,255,255,0.5)"
    }
  : {
      grid: "rgba(0,0,0,0.1)",
      data: "rgba(0,0,0,0.25)"
    };

let options = {
  scales: {
    x: { grid: { color: theme.grid, borderColor: theme.grid } },
    y: { grid: { color: theme.grid, borderColor: theme.grid } }
  },
  legend: { labels: { fontColor: theme.data } },
  plugins: { legend: { display: false } }
};

window.onload = () => {
  if (isDarkTheme) {
    document.body.style.backgroundColor = "rgb(40, 40, 40)";
    document.body.style.color = "rgb(240, 240, 240)";
  }

  const toggle = document.getElementById("toggle");
  toggle.innerText = isDarkTheme ? "🌙" : "🌞";
  toggle.onclick = () => {
    localStorage.setItem("darkTheme", !isDarkTheme);
    location.reload();
  };

  fetch("package.json")
    .then(package => package.json())
    .then(package => {
      document.title = package.title + " - Package Explorer";
      for (const section of package.sections) {
        const sectionElement = document.createElement("div");
        const titleElement = document.createElement("h1");
        titleElement.innerText = section.title;

        for (const row of section.rows) {
          const rowElement = document.createElement("section");

          for (const block of row) {
            const blockContainerElement = document.createElement("div");

            const blockElement = document.createElement("div");
            blockElement.classList.add("block");
            blockContainerElement.appendChild(blockElement);

            const titleElement = document.createElement("h3");
            titleElement.style.fontWeight = 400;
            titleElement.style.textAlign = "center";
            titleElement.innerText = block.title;
            blockContainerElement.appendChild(titleElement);

            switch (block.type) {
              case "text_large":
                const largeTextElement = document.createElement("h1");
                largeTextElement.style.fontSize = "96px";
                largeTextElement.innerText = block.data;
                blockElement.appendChild(largeTextElement);
                break;

              case "text_small":
                const smallTextElement = document.createElement("h1");
                smallTextElement.style.fontWeight = 400;
                smallTextElement.innerText = block.data;
                blockElement.appendChild(smallTextElement);
                break;

              case "chart":
                const canvasElement = document.createElement("canvas");
                const ctx = canvasElement.getContext("2d");
                for (const dataset of block.data.datasets) {
                  dataset.borderColor = theme.data;
                  dataset.backgroundColor = theme.data;
                }

                const chart = new Chart(ctx, {
                  type: block.chart_type,
                  data: block.data,
                  options
                });

                charts.add(chart);
                blockElement.appendChild(canvasElement);
                break;

              default:
                console.log("Unknown block type: " + block.type);
            }

            rowElement.appendChild(blockContainerElement);
          }

          sectionElement.appendChild(rowElement);
        }

        document.body.appendChild(titleElement);
        document.body.appendChild(sectionElement);
      }
    });
};