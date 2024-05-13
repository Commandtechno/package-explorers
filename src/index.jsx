import "./__dayjs";
import "./__env";
import "./__jsx";

import { ServiceCard } from "./components/ServiceCard";
import services from "./services";
import { $ } from "./util/helpers";

const app = $("app");

app.replaceChildren(
  <h1 className="service-card-title">Pick a supported service:</h1>,
  <div className="service-card-footer">
    This website does not collect any data. All data is processed locally in your browser. The source code is available on <a href="https://github.com/Commandtechno/package-explorers">GitHub</a>. Please do not blindly trust websites with sensitive data like this.
  </div>,
  <main className="service-card-list">
    {services.map(service => (
      <ServiceCard {...service} />
    ))}
  </main>,
);
