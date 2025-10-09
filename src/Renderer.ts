import { Application, Container, Graphics } from "pixi.js";
import { GRID_SIZE, type Coordinate } from "./OfflineLogic";

export class Renderer {
  private head: Graphics = new Graphics()
    .rect(0, 0, 10, 10)
    .fill("rgb(255, 81, 0)")
    .stroke({
      width: 2,
      color: "gray",
    });
  private bodies: Container = new Container();

  constructor(app: Application) {
    app.stage.addChild(this.bodies);
    app.stage.addChild(this.head);
  }

  public set = (head: Coordinate, bodies: Array<Coordinate>) => {
    this.head.position.x = Math.floor(head.x / GRID_SIZE) * GRID_SIZE;
    this.head.position.y = Math.floor(head.y / GRID_SIZE) * GRID_SIZE;

    const difference = this.bodies.children.length - bodies.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        this.bodies.children.pop();
      }
    } else if (difference < 0) {
      for (let i = difference; i < 0; i++) {
        const bodyGraphicContainer = new Container();
        const bodyGraphic = new Graphics().rect(0, 0, 10, 10).fill("gray");
        bodyGraphic.alpha = 0.5;
        bodyGraphic.stroke({
          width: 2,
          color: "gray",
        });

        bodyGraphicContainer.addChild(bodyGraphic);

        this.bodies.addChild(bodyGraphicContainer);
      }
    }

    this.bodies.children.forEach((body, i) => {
      const newBody = bodies[i];

      body.position.x = Math.floor(newBody.x / GRID_SIZE) * GRID_SIZE;
      body.position.y = Math.floor(newBody.y / GRID_SIZE) * GRID_SIZE;
    });
  };
}
