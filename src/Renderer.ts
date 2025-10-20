import { Application, Container, Graphics, type FillInput } from "pixi.js";
import { DEFAULT_GRID_SIZE, type Coordinate } from "./OfflineLogic";

export class Renderer {
  private bodies: Container = new Container();
  private head;
  private normalfood;
  private specialFood;
  private poisonFood;

  private gridSize: number;

  constructor(app: Application, gridSize: number | undefined) {
    this.gridSize = gridSize ?? DEFAULT_GRID_SIZE;

    this.head = this.newPixel("rgb(255, 81, 0)");
    this.normalfood = this.newPixel("rgb(0, 156, 52)");
    this.specialFood = this.newPixel("rgb(107, 0, 168)");
    this.poisonFood = this.newPixel("rgba(155, 10, 0, 1)");

    app.stage.addChild(this.bodies);
    app.stage.addChild(this.head);
    app.stage.addChild(this.normalfood);
    app.stage.addChild(this.specialFood);
    app.stage.addChild(this.poisonFood);
  }

  public set = (
    head: Coordinate,
    bodies: Array<Coordinate>,
    normalfood: Coordinate,
    specialFood: Coordinate,
    poisonFood: Coordinate,
  ) => {
    this.head.position.x = head.x;
    this.head.position.y = head.y;

    const difference = this.bodies.children.length - bodies.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        this.bodies.children.pop();
      }
    } else if (difference < 0) {
      for (let i = difference; i < 0; i++) {
        const body = this.newPixel("gray");
        this.bodies.addChild(body);
      }
    }

    this.bodies.children.forEach((body, i) => {
      const newBody = bodies[i];
      if (newBody === undefined) {
        return;
      }

      body.position.set(newBody.x, newBody.y);
    });

    this.normalfood.position.set(normalfood.x, normalfood.y);
    this.specialFood.position.set(specialFood.x, specialFood.y);
    this.poisonFood.position.set(poisonFood.x, poisonFood.y);
  };

  private newPixel = (fill: FillInput) => {
    const pixel = new Graphics()
      .rect(0, 0, this.gridSize, this.gridSize)
      .fill(fill)
      .stroke({
        width: 2,
        color: "gray",
      });
    pixel.alpha = 0.2;
    pixel.position.set(0 - this.gridSize, 0 - this.gridSize);
    return pixel;
  }
}
