import { $ } from "@common/util/helpers";
import { Dropzone } from "./Dropzone";

const app = $("app");

export function ServiceCard(service) {
  return (
    <img
      className="service-card"
      src={service.banner}
      alt={service.name}
      onclick={() => {
        app.style.setProperty('--foreground-accent', service.accentColor)
        app.replaceChildren(
          <div className="service-upload-container">
            <h3 className="instructions">Click <a href={service.instructions}>here</a> to learn how to receive your {service.name} data package</h3>
            <Dropzone {...service} />
          </div>
        )
      }}
    />
  );
}