import "./__dayjs";
import "./__env";
import "./__jsx";

import { ServiceCard } from "./components/ServiceCard";
import services from "./services";
import { $ } from "./util/helpers";

const app = $("app");

app.replaceChildren(
  <h1 className="service-card-title">Pick a supported service:</h1>,
  <div className="service-card-list">
    {services.map(service => (
      <ServiceCard {...service} />
    ))}
  </div>
);