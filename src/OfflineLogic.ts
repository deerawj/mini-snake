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

type Spin = {
  angle: number;
  angleAmount: number;
  x: number;
  y: number;
};

/// Pixel Coordinates
/// Game Coordinates: floor(the pixel coordinate / 5).

// snake will only show resolution of blocks of 5 to give the traditional snake look. BUT will have a higher accuracy to account for going diagonally (and between).
export class OfflineLogic {
  head: SnakeBody;
  bodies: Array<SnakeBody>;
  normalfood: Food;
  specialFood: Food;
  poisonFood: Food;
  length: number;

  velocity: Velocity = generateRandomVelocity();

  width: number;
  height: number;

  spin: Spin | undefined;

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

  public update = () => {
    const currentX = Math.floor(this.bodies[0].x / GRID_SIZE) * GRID_SIZE;
    const currentY = Math.floor(this.bodies[0].y / GRID_SIZE) * GRID_SIZE;
    const newX = Math.floor(this.head.x / GRID_SIZE) * GRID_SIZE;
    const newY = Math.floor(this.head.y / GRID_SIZE) * GRID_SIZE;

    // diagonal
    if (currentX !== newX && currentY !== newY) {
      if (newX > currentX && newY > currentY) {
        // moving bottom-right
        this.bodies.unshift(
          { x: this.head.x, y: this.head.y },
          { x: this.head.x, y: this.bodies[0].y }
        );
      } else if (newX < currentX && newY > currentY) {
        // moving bottom-left
        this.bodies.unshift(
          { x: this.head.x, y: this.head.y },
          { x: this.head.x, y: this.bodies[0].y }
        );
      } else if (newX > currentX && newY < currentY) {
        // moving top-right
        this.bodies.unshift(
          { x: this.head.x, y: this.head.y },
          { x: this.head.x, y: this.bodies[0].y }
        );
      } else if (newX < currentX && newY < currentY) {
        // moving top-left
        this.bodies.unshift(
          { x: this.head.x, y: this.head.y },
          { x: this.head.x, y: this.bodies[0].y }
        );
      }

      this.bodies.pop();
      this.bodies.pop();
    } else {
      this.bodies.unshift({ x: this.head.x, y: this.head.y });
      this.bodies.pop();
    }

    if (this.spin !== undefined) {
      this.spin.angle += this.spin.angleAmount;
      this.velocity.x = Math.cos(this.spin.angle);
      this.velocity.y = Math.sin(this.spin.angle);
      this.velocity = normalizeVelocity(this.velocity, GRID_SIZE);
    }

    this.head.x += this.velocity.x;
    this.head.y += this.velocity.y;

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

  /// TODO: add the ability to premove / setVelocity queue
  public setVelocity = (velocity: Velocity) => {
    if (velocity.x === 0 && velocity.y === 0) {
      return;
    }

    const normalizedVelocity = normalizeVelocity(velocity, GRID_SIZE);

    // const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
    // const proposedAngle = Math.atan2(
    //   normalizedVelocity.y,
    //   normalizedVelocity.x
    // );

    // let angleDifference = Math.abs(currentAngle - proposedAngle);
    // angleDifference =
    //   angleDifference > Math.PI
    //     ? 2 * Math.PI - angleDifference
    //     : angleDifference;

    // // Threshold check
    // const THRESHOLD = Math.PI / 4; // 45 degrees in radians

    // console.log(Math.abs(angleDifference - THRESHOLD));
    // if (Math.abs(angleDifference - THRESHOLD) > 2) {
    //   console.log("ret");
    //   return;
    // }

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
