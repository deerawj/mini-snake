import type { Velocity } from "./OfflineLogic";

export class Interaction {
  onVelocityChange: (velocity: Velocity) => unknown;

  constructor(onVelocityChange: (velocity: Velocity) => unknown) {
    this.onVelocityChange = onVelocityChange;
    window.addEventListener("keydown", (keydown) => {
      if (keydown.key == "w") {
        this.onVelocityChange({ x: 0.0, y: -1.0 });
      } else if (keydown.key == "a") {
        this.onVelocityChange({ x: -1.0, y: 0.0 });
      } else if (keydown.key == "s") {
        this.onVelocityChange({ x: 0.0, y: 1.0 });
      } else if (keydown.key == "d") {
        this.onVelocityChange({ x: 1.0, y: 0.0 });
      }
    });
  }
}
