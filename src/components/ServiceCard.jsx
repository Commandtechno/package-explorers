import { $ } from "@common/util/helpers";
import { Dropzone } from "./Dropzone";

const root = $("root");

export function ServiceCard(service) {
  return (
    <img
      className="service-card"
      src={service.banner}
      alt={service.name}
      onclick={() => root.replaceChildren(<Dropzone {...service} />)}
    />
  );
}