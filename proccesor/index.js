window.onload = () => {
  fetch("package.json")
    .then(package => package.json())
    .then(package => {
      document.title = package.title + " - Package Explorer";
      for (const section of package.sections) {
        const sectionElement = document.createElement("section");
        const titleElement = document.createElement("h1");
        titleElement.innerText = section.title;

        for (const block of section.blocks) {
          const blockElement = document.createElement("div");
          blockElement.classList.add("block");

          switch (block.type) {
            case "text":
              const textElement = document.createElement("p");
              textElement.innerText = block.data;
              blockElement.appendChild(textElement);
              break;

            case "chart":
              const canvasElement = document.createElement("canvas");
              const ctx = canvasElement.getContext("2d");
              new Chart(ctx, { type: block.chart_type, data: block.data });
              blockElement.appendChild(canvasElement);
              break;
          }

          sectionElement.appendChild(blockElement);
        }

        document.body.appendChild(titleElement);
        document.body.appendChild(sectionElement);
      }
    });
};