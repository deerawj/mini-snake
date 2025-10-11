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

enum Input {
  Target,
  Velocity,
}

export class OfflineLogic {
  exactHead: Coordinate;
  head: SnakeBody;
  bodies: Array<SnakeBody>;
  normalfood: Food;
  specialFood: Food;
  poisonFood: Food;
  length: number;

  lastInput: Input = Input.Velocity;

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
    this.exactHead = { x: this.head.x, y: this.head.y };
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
    const oppositeDirections = {
      [Direction.Up]: Direction.Down,
      [Direction.Down]: Direction.Up,
      [Direction.Left]: Direction.Right,
      [Direction.Right]: Direction.Left,
    };

    const isTurn =
      newDirection !== this.currentDirection &&
      newDirection !== oppositeDirections[this.currentDirection];

    if (isTurn && this.updatesSinceLastTurn > 1) {
      this.currentDirection = newDirection;
      this.updatesSinceLastTurn = 0;
    }
  };

  private setDirectionFromVelocity = () => {
    const x = this.exactHead.x - this.head.x;
    const y = this.exactHead.y - this.head.y;

    if (Math.abs(x) > Math.abs(y)) {
      this.setDirection(x > 0 ? Direction.Right : Direction.Left);
    } else {
      this.setDirection(y > 0 ? Direction.Down : Direction.Up);
    }
  };

  public update = () => {
    if (this.lastInput === Input.Velocity) {
      this.exactHead.x += this.velocity.x;
      this.exactHead.y += this.velocity.y;
    }

    if (this.velocity !== undefined) {
      this.setDirectionFromVelocity();
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

    this.updatesSinceLastTurn += 1;
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
    this.lastInput = Input.Target;

    this.exactHead.x = target.x;
    this.exactHead.y = target.y;
  };

  /// TODO: add the ability to premove / setVelocity queue
  public setVelocity = (velocity: Velocity) => {
    this.lastInput = Input.Velocity;

    if (velocity.x === 0 && velocity.y === 0) {
      return;
    }

    const normalizedVelocity = normalizeVelocity(velocity, GRID_SIZE);

    if (
      this.velocity === undefined ||
      this.velocity.x !== normalizedVelocity.x ||
      this.velocity.y !== normalizedVelocity.y
    ) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;

      this.velocity = normalizedVelocity;
      this.spin = undefined;
    }
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
