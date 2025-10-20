import type { Coordinate, SnakeBody, Velocity } from "./OfflineLogic";

export class Interaction implements Disposable {
  snakeHead: SnakeBody;
  onVelocityChange: (velocity: Velocity) => unknown;
  onTargetChange: (target: Coordinate) => unknown;

  constructor(
    snakeHead: SnakeBody,
    onVelocityChange: (velocity: Velocity) => unknown,
    onTargetChange: (target: Coordinate) => unknown
  ) {
    this.snakeHead = snakeHead;
    this.onVelocityChange = onVelocityChange;
    this.onTargetChange = onTargetChange;

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  [Symbol.dispose](): void {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private onKeyDown = (keydown: KeyboardEvent) => {
    let x = 0;
    let y = 0;

    if (keydown.key === "w") {
      y -= 1;
    }

    if (keydown.key === "ArrowUp") {
      y -= 1;
    }

    if (keydown.key === "a") {
      x -= 1;
    }

    if (keydown.key === "ArrowLeft") {
      x -= 1;
    }

    if (keydown.key === "s") {
      y += 1;
    }

    if (keydown.key === "ArrowDown") {
      y += 1;
    }

    if (keydown.key === "d") {
      x += 1;
    }

    if (keydown.key === "ArrowRight") {
      x += 1;
    }

    this.onVelocityChange({ x, y });
  };

  private onPointerMove = (pointerEvent: PointerEvent) => {
    this.onTargetChange({ x: pointerEvent.x, y: pointerEvent.y });
  };

  // public shouldInvokeCirculation = (): boolean => {
  //   if (this.primaryInput !== Inputs.Pointer) {
  //     return false;
  //   }

  //   const magnitudeX = this.lastPointerMovement.x - this.snakeHead.x;
  //   const magnitudeY = this.lastPointerMovement.y - this.snakeHead.y;
  //   if (
  //     magnitudeX <= 10 &&
  //     magnitudeX >= -10 &&
  //     magnitudeY <= 10 &&
  //     magnitudeY >= -10
  //   ) {
  //     return true;
  //   }

  //   return false;
  // };
}
