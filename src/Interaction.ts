import type { SnakeBody, Velocity } from "./OfflineLogic";

export class Interaction {
  snakeHead: SnakeBody;
  onVelocityChange: (velocity: Velocity) => unknown;

  constructor(
    snakeHead: SnakeBody,
    onVelocityChange: (velocity: Velocity) => unknown
  ) {
    this.snakeHead = snakeHead;
    this.onVelocityChange = onVelocityChange;

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  public dispose() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private onKeyDown = (keydown: KeyboardEvent) => {
    if (keydown.key == "w") {
      this.onVelocityChange({ x: 0.0, y: -1.0 });
    } else if (keydown.key == "a") {
      this.onVelocityChange({ x: -1.0, y: 0.0 });
    } else if (keydown.key == "s") {
      this.onVelocityChange({ x: 0.0, y: 1.0 });
    } else if (keydown.key == "d") {
      this.onVelocityChange({ x: 1.0, y: 0.0 });
    }
  };

  private onPointerMove = (pointerEvent: PointerEvent) => {
    const magnitudeX = pointerEvent.clientX - this.snakeHead.x;
    const magnitudeY = pointerEvent.clientY - this.snakeHead.y;
    if (
      magnitudeX <= 10 &&
      magnitudeX >= -10 &&
      magnitudeY <= 10 &&
      magnitudeY >= -10
    ) {
      this.onVelocityChange({ x: 0, y: 0 });
      return;
    }

    this.onVelocityChange({ x: magnitudeX, y: magnitudeY });
  };
}
