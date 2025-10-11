import type { Coordinate, SnakeBody, Velocity } from "./OfflineLogic";

export class Interaction {
  snakeHead: SnakeBody;
  onVelocityChange: (velocity: Velocity) => unknown;
  onTargetChange: (target: Coordinate) => unknown;
  keysPressed: Set<string> = new Set<string>();

  constructor(
    snakeHead: SnakeBody,
    onVelocityChange: (velocity: Velocity) => unknown,
    onTargetChange: (target: Coordinate) => unknown
  ) {
    this.snakeHead = snakeHead;
    this.onVelocityChange = onVelocityChange;
    this.onTargetChange = onTargetChange;

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  public dispose() {
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private onKeyUp = (keydown: KeyboardEvent) => {
    this.keysPressed.delete(keydown.key);
    this.updateVelocityBasedOnKeyDown();
  };

  private onKeyDown = (keydown: KeyboardEvent) => {
    this.keysPressed.add(keydown.key);
    this.updateVelocityBasedOnKeyDown();
  };

  private onPointerMove = (pointerEvent: PointerEvent) => {
    this.onTargetChange({ x: pointerEvent.x, y: pointerEvent.y });
  };

  private updateVelocityBasedOnKeyDown = () => {
    let x = 0;
    let y = 0;

    if (this.keysPressed.has("w")) {
      y -= 1;
    }

    if (this.keysPressed.has("ArrowUp")) {
      y -= 1;
    }

    if (this.keysPressed.has("a")) {
      x -= 1;
    }

    if (this.keysPressed.has("ArrowLeft")) {
      x -= 1;
    }

    if (this.keysPressed.has("s")) {
      y += 1;
    }

    if (this.keysPressed.has("ArrowDown")) {
      y += 1;
    }

    if (this.keysPressed.has("d")) {
      x += 1;
    }

    if (this.keysPressed.has("ArrowRight")) {
      x += 1;
    }

    this.onVelocityChange({ x, y });
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
