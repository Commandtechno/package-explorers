import "./__jsx";

import { ServiceCard } from "./components/ServiceCard";
import services from "./services";
import { $ } from "./util/helpers";

const root = $("root");

root.appendChild(
  <div className="service-card-list">
    {services.map(service => (
      <ServiceCard {...service} />
    ))}
  </div>
);