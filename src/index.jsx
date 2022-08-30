import "./__dayjs";
import "./__env";
import "./__jsx";

import { ServiceCard } from "./components/ServiceCard";
import services from "./services";
import { $ } from "./util/helpers";

const app = $("app");

app.replaceChildren(
  <div className="service-card-list">
    {services.map(service => (
      <ServiceCard {...service} />
    ))}
  </div>
);