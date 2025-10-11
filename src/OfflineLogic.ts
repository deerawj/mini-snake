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

  nextVelocity: Velocity | undefined;
  nextNextVelocity: Velocity | undefined;

  velocity: Velocity | undefined = generateRandomVelocity();
  target: Coordinate | undefined;

  currentDirection: Direction = Direction.Right;

  private width: number;
  private height: number;

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

  public setWidthAndHeight = (width: number, height: number) => {
    this.width = width;
    this.height = height;

    this.normalfood = this.calculateNewFoodPosition(this.normalfood);
    this.specialFood = this.calculateNewFoodPosition(this.specialFood);
    this.poisonFood = this.calculateNewFoodPosition(this.poisonFood);
  };

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

    if (isTurn) {
      if (this.lastInput === Input.Target && this.updatesSinceLastTurn < 2) {
        return;
      }

      this.currentDirection = newDirection;
      this.updatesSinceLastTurn = 0;
    }
  };

  private setDirectionFromVelocity = () => {
    const vx = this.exactHead.x - this.head.x;
    const vy = this.exactHead.y - this.head.y;

    if (vx === 0 && vy === 0) return;

    const angle = Math.atan2(vy, vx);

    if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
      this.setDirection(Direction.Right);
    } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
      this.setDirection(Direction.Down);
    } else if (angle >= -(3 * Math.PI) / 4 && angle < -Math.PI / 4) {
      this.setDirection(Direction.Up);
    } else {
      this.setDirection(Direction.Left);
    }
  };

  private applyVelocity = (velocity: Velocity) => {
    if (
      this.velocity === undefined ||
      this.velocity.x !== velocity.x ||
      this.velocity.y !== velocity.y
    ) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;

      this.velocity = velocity;
    }
  };

  private calculateNewFoodPosition = (value: Coordinate): Coordinate => {
    if (
      value.x < 0 ||
      value.x > this.width ||
      value.y < 0 ||
      value.y > this.height
    ) {
      return generateRandomCoordinate(this.width, this.height);
    }

    return value;
  };

  public update = () => {
    if (this.nextVelocity !== undefined) {
      this.lastInput = Input.Velocity;
      this.applyVelocity(this.nextVelocity);
      this.nextVelocity = this.nextNextVelocity;
      this.nextNextVelocity = undefined;
    }

    if (this.lastInput === Input.Velocity && this.velocity !== undefined) {
      this.exactHead.x += this.velocity.x;
      this.exactHead.y += this.velocity.y;
    }

    this.setDirectionFromVelocity();

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

    let wrappedAround = false;

    if (this.head.x < 0) {
      this.head.x = this.width;
      wrappedAround = true;
    } else if (this.head.x > this.width) {
      this.head.x = 0;
      wrappedAround = true;
    }

    if (this.head.y < 0) {
      this.head.y = this.height;
      wrappedAround = true;
    } else if (this.head.y > this.height) {
      this.head.y = 0;
      wrappedAround = true;
    }

    if (wrappedAround) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;
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

  public setVelocity = (velocity: Velocity) => {
    if (velocity.x === 0 && velocity.y === 0) {
      return;
    }

    const normalizedVelocity = normalizeVelocity(velocity, GRID_SIZE);

    if (this.nextVelocity === undefined) {
      this.nextVelocity = normalizedVelocity;
    } else {
      this.nextNextVelocity = normalizedVelocity;
    }
  };
}

function generateRandomVelocity(): Velocity {
  return normalizeVelocity({ x: 0.0, y: 1.0 }, GRID_SIZE);
}

function generateRandomCoordinate(width: number, height: number): Coordinate {
  const toGrid = (pixel: number) => {
    return Math.floor(pixel / GRID_SIZE) * GRID_SIZE;
  };

  const randInt = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  return {
    x: toGrid(randInt(width)),
    y: toGrid(randInt(height)),
  };
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
