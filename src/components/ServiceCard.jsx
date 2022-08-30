import { $ } from "@common/util/helpers";
import { Dropzone } from "./Dropzone";

const app = $("app");

export function ServiceCard(service) {
  return (
    <img
      className="service-card"
      src={service.banner}
      alt={service.name}
      onclick={() => app.replaceChildren(<Dropzone {...service} />)}
    />
  );
}