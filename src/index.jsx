import "./__jsx";

import { ServiceCard } from "./components/ServiceCard";
import services from "./services";

const root = document.getElementById("root");

root.appendChild(
  <div className="service-card-list">
    {services.map(service => (
      <ServiceCard {...service} />
    ))}
  </div>
);