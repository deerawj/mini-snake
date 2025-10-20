export const DEFAULT_GRID_SIZE = 20;
export const DEFAULT_STARTING_LENGTH = 10;

export type Coordinate = {
  x: number;
  y: number;
};

export type Config = {
  width: number;
  height: number;
  gridSize: number;
  startingLength: number
}

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

enum Input {
  Target,
  Velocity,
}

enum CollisionResult {
  Nothing,
  Self,
  NormalFood,
  SpecialFood,
  PoisonFood,
}

export class OfflineLogic {
  exactHead: Coordinate;
  head: SnakeBody;
  bodies: Array<SnakeBody>;
  normalfood: Food;
  specialFood: Food;
  poisonFood: Food;

  lastInput: Input = Input.Velocity;

  nextVelocity: Velocity | undefined;
  nextNextVelocity: Velocity | undefined;

  velocity: Velocity | undefined;
  target: Coordinate | undefined;

  currentDirection: Direction = Direction.Right;

  private width: number;
  private height: number;
  private gridSize: number;

  updatesSinceLastTurn: number = 0;

  constructor(config: Partial<Config>) {
    this.width = config.width ?? window.innerWidth;
    this.height = config.height ?? window.innerHeight;
    this.gridSize = config.gridSize ?? DEFAULT_GRID_SIZE;

    this.velocity = this.generateRandomVelocity();

    this.head = this.generateRandomCoordinate(this.width, this.height);
    this.exactHead = { x: this.head.x, y: this.head.y };
    this.normalfood = this.generateRandomCoordinate(this.width, this.height);
    this.specialFood = this.generateRandomCoordinate(this.width, this.height);
    this.poisonFood = this.generateRandomCoordinate(this.width, this.height);
    this.bodies = Array.from({ length: config.startingLength ?? DEFAULT_STARTING_LENGTH }, () => ({
      x: this.head.x,
      y: this.head.y,
    }));
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
      return this.generateRandomCoordinate(this.width, this.height);
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
      this.head.y -= this.gridSize;
    } else if (this.currentDirection === Direction.Left) {
      this.head.x -= this.gridSize;
    } else if (this.currentDirection === Direction.Down) {
      this.head.y += this.gridSize;
    } else if (this.currentDirection === Direction.Right) {
      this.head.x += this.gridSize;
    }

    this.bodies.unshift({ x: this.head.x, y: this.head.y });
    this.bodies.pop();

    let wrappedAround = false;

    if (this.head.x < 0) {
      this.head.x = this.floorToGrid(this.width);
      wrappedAround = true;
    } else if (this.head.x > this.width) {
      this.head.x = 0;
      wrappedAround = true;
    }

    if (this.head.y < 0) {
      this.head.y = this.floorToGrid(this.height);
      wrappedAround = true;
    } else if (this.head.y > this.height) {
      this.head.y = 0;
      wrappedAround = true;
    }

    if (wrappedAround) {
      this.exactHead.x = this.head.x;
      this.exactHead.y = this.head.y;
    }

    const collision = this.checkForCollision();
    if (collision === CollisionResult.NormalFood) {
      this.addLength(1);
      this.normalfood = this.generateRandomCoordinate(this.width, this.height);
    } else if (collision === CollisionResult.SpecialFood) {
      this.addLength(4);
      this.specialFood = this.generateRandomCoordinate(this.width, this.height);
    } else if (collision === CollisionResult.PoisonFood) {
      this.addLength(-6);
      this.poisonFood = this.generateRandomCoordinate(this.width, this.height);
    }

    this.updatesSinceLastTurn += 1;
  };

  private addLength = (amount: number) => {
    if (amount > 0) {
      const lastBody = this.bodies[this.bodies.length - 1];
      const x = lastBody !== undefined ? lastBody.x : this.head.x;
      const y = lastBody !== undefined ? lastBody.y : this.head.y;

      for (let i = 0; i < amount; i++) {
        this.bodies.push({ x, y });
      }
    } else if (amount < 0) {
      for (let i = amount; i < 0; i++) {
        this.bodies.pop();
      }
    }
  };

  public checkForCollision = (): CollisionResult => {
    if (
      this.head.x === this.normalfood.x &&
      this.head.y === this.normalfood.y
    ) {
      return CollisionResult.NormalFood;
    }

    if (
      this.head.x === this.specialFood.x &&
      this.head.y === this.specialFood.y
    ) {
      return CollisionResult.SpecialFood;
    }

    if (
      this.head.x === this.poisonFood.x &&
      this.head.y === this.poisonFood.y
    ) {
      return CollisionResult.PoisonFood;
    }

    if (
      this.bodies.every(
        (body) => !(body.x === this.head.x && body.x === this.head.x)
      )
    ) {
      return CollisionResult.Self;
    }

    return CollisionResult.Nothing;
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

    const normalizedVelocity = normalizeVelocity(velocity, this.gridSize);

    if (this.nextVelocity === undefined) {
      this.nextVelocity = normalizedVelocity;
    } else {
      this.nextNextVelocity = normalizedVelocity;
    }
  };

  private generateRandomVelocity(): Velocity {
    return normalizeVelocity({ x: 0.0, y: 1.0 }, this.gridSize);
  }

  private floorToGrid = (pixel: number) => {
    return Math.floor(pixel / this.gridSize) * this.gridSize;
  }

  private generateRandomCoordinate(width: number, height: number): Coordinate {
    const randInt = (max: number) => {
      return Math.floor(Math.random() * max);
    };

    return {
      x: this.floorToGrid(randInt(width)),
      y: this.floorToGrid(randInt(height)),
    };
  }
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
