export const GRID_SIZE = 20;

export type Coordinate = {
  x: number;
  y: number;
};

export type SnakeBody = Coordinate;
export type Food = Coordinate;

export type Velocity = { x: number; y: number };

export type AlteredPieces = {
  head: Coordinate;
  bodyAdded: Array<Coordinate>;
  bodyRemoved: Array<Coordinate>;
};

enum Direction {
  Up,
  Left,
  Down,
  Right,
}

type Spin = {
  angle: number;
  angleAmount: number;
  x: number;
  y: number;
};

export class OfflineLogic {
  head: SnakeBody;
  bodies: Array<SnakeBody>;
  normalfood: Food;
  specialFood: Food;
  poisonFood: Food;
  length: number;

  velocity: Velocity | undefined = generateRandomVelocity();
  target: Coordinate | undefined;

  currentDirection: Direction = Direction.Right;

  width: number;
  height: number;

  spin: Spin | undefined;

  updatesSinceLastTurn: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.length = 10;

    this.head = generateRandomCoordinate(this.width, this.height);
    this.normalfood = generateRandomCoordinate(this.width, this.height);
    this.specialFood = generateRandomCoordinate(this.width, this.height);
    this.poisonFood = generateRandomCoordinate(this.width, this.height);
    this.bodies = Array.from({ length: this.length }, () => ({
      x: this.head.x,
      y: this.head.y,
    }));

    this.invokeSpin(0, 0);
  }

  private setDirection = (newDirection: Direction) => {
    if (
      newDirection === Direction.Up &&
      this.currentDirection !== Direction.Down
    ) {
      this.currentDirection = Direction.Up;
    } else if (
      newDirection === Direction.Down &&
      this.currentDirection !== Direction.Up
    ) {
      this.currentDirection = Direction.Down;
    } else if (
      newDirection === Direction.Left &&
      this.currentDirection !== Direction.Right
    ) {
      this.currentDirection = Direction.Left;
    } else if (
      newDirection === Direction.Right &&
      this.currentDirection !== Direction.Left
    ) {
      this.currentDirection = Direction.Right;
    }
  };

  private setDirectionTowardsTarget = (target: Coordinate) => {
    const distanceX = this.head.x - this.target.x;
    const distanceY = this.head.y - this.target.y;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < 10) {
      return;
    }

    const direction = Math.abs(distanceX) - Math.abs(distanceY);
    if (direction > 20) {
      if (this.head.x < target.x) {
        this.setDirection(Direction.Right);
      } else if (this.head.x > target.x) {
        this.setDirection(Direction.Left);
      }
    } else if (direction < -20) {
      if (this.head.y > target.y) {
        this.setDirection(Direction.Up);
      } else if (this.head.y < target.y) {
        this.setDirection(Direction.Down);
      }
    }
  };

  private setDirectionFromVelocity = (velocity: Velocity) => {
    const { x, y } = velocity;

    if (Math.abs(x) > Math.abs(y)) {
      this.setDirection(x > 0 ? Direction.Right : Direction.Left);
    } else {
      this.setDirection(y > 0 ? Direction.Down : Direction.Up);
    }
  };

  public update = () => {
    if (this.target !== undefined) {
      this.setDirectionTowardsTarget(this.target);
    } else if (this.velocity !== undefined) {
      this.setDirectionFromVelocity(this.velocity);
    }

    if (this.currentDirection === Direction.Up) {
      this.head.y -= GRID_SIZE;
    } else if (this.currentDirection === Direction.Left) {
      this.head.x -= GRID_SIZE;
    } else if (this.currentDirection === Direction.Down) {
      this.head.y += GRID_SIZE;
    } else if (this.currentDirection === Direction.Right) {
      this.head.x += GRID_SIZE;
    }

    this.bodies.unshift({ x: this.head.x, y: this.head.y });
    this.bodies.pop();

    if (this.head.x < 0) {
      this.head.x = this.width;
    } else if (this.head.x > this.width) {
      this.head.x = 0;
    }

    if (this.head.y < 0) {
      this.head.y = this.height;
    } else if (this.head.y > this.height) {
      this.head.y = 0;
    }
  };

  public invokeSpin = (x: number, y: number) => {
    const angle = Math.atan2(this.velocity.y, this.velocity.x);

    let angleAmount = -0.05;
    if (Math.random() < 0.5) {
      angleAmount = 0.05;
    }

    this.spin = {
      angle,
      angleAmount,
      x,
      y,
    };
  };

  public setTarget = (target: Coordinate) => {
    this.velocity = undefined;
    this.target = target;
  };

  /// TODO: add the ability to premove / setVelocity queue
  public setVelocity = (velocity: Velocity) => {
    if (velocity.x === 0 && velocity.y === 0) {
      return;
    }
    this.target = undefined;

    const normalizedVelocity = normalizeVelocity(velocity, GRID_SIZE);
    this.velocity = normalizedVelocity;
    this.spin = undefined;
  };
}

function generateRandomVelocity(): Velocity {
  return normalizeVelocity({ x: 0.0, y: 1.0 }, GRID_SIZE);
}

function generateRandomCoordinate(width: number, height: number): Coordinate {
  return {
    x: generateRandomInt(width),
    y: generateRandomInt(height),
  };
}

function generateRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function normalizeVelocity(velocity: Velocity, constant: number) {
  const magnitude = Math.hypot(velocity.x, velocity.y);
  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  const desiredSpeed = constant;
  return {
    x: (velocity.x / magnitude) * desiredSpeed,
    y: (velocity.y / magnitude) * desiredSpeed,
  };
}
