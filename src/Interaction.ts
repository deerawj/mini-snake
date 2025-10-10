import type { Coordinate, SnakeBody, Velocity } from "./OfflineLogic";

export enum Inputs {
  Unknown,
  Keys,
  Pointer,
}

export class Interaction {
  snakeHead: SnakeBody;
  onVelocityChange: (velocity: Velocity) => unknown;
  onFetch: () => unknown;
  keysPressed: Set<string> = new Set<string>();
  primaryInput: Inputs = Inputs.Unknown;
  lastPointerMovement: Coordinate = { x: 0, y: 0 };

  constructor(
    snakeHead: SnakeBody,
    onVelocityChange: (velocity: Velocity) => unknown,
    onFetch: () => unknown
  ) {
    this.snakeHead = snakeHead;
    this.onVelocityChange = onVelocityChange;
    this.onFetch = onFetch;

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
    this.primaryInput = Inputs.Keys;
    this.keysPressed.add(keydown.key);
    this.updateVelocityBasedOnKeyDown();
  };

  private onPointerMove = (pointerEvent: PointerEvent) => {
    this.primaryInput = Inputs.Pointer;
    this.lastPointerMovement = { x: pointerEvent.x, y: pointerEvent.y };

    const magnitudeX = pointerEvent.clientX - this.snakeHead.x;
    const magnitudeY = pointerEvent.clientY - this.snakeHead.y;

    this.onVelocityChange({ x: magnitudeX, y: magnitudeY });
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

  public shouldInvokeCirculation = (): boolean => {
    if (this.primaryInput !== Inputs.Pointer) {
      return false;
    }

    const magnitudeX = this.lastPointerMovement.x - this.snakeHead.x;
    const magnitudeY = this.lastPointerMovement.y - this.snakeHead.y;
    if (
      magnitudeX <= 10 &&
      magnitudeX >= -10 &&
      magnitudeY <= 10 &&
      magnitudeY >= -10
    ) {
      return true;
    }

    return false;
  };
}
