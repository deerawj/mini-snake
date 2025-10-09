import { Application, Container, Graphics } from "pixi.js";
import type { Coordinate } from "./OfflineLogic";

export class Renderer {
  private head: Graphics = new Graphics().circle(0, 0, 6).fill("red");
  private bodies: Container = new Container();

  constructor(app: Application) {
    app.stage.addChild(this.bodies);
    app.stage.addChild(this.head);
  }

  public set = (head: Coordinate, bodies: Array<Coordinate>) => {
    this.head.position.x = head.x;
    this.head.position.y = head.y;

    const difference = this.bodies.children.length - bodies.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        this.bodies.children.pop();
      }
    } else if (difference < 0) {
      for (let i = difference; i < 0; i++) {
        this.bodies.addChild(new Graphics().circle(0, 0, 6).fill("gray"));
      }
    }

    this.bodies.children.forEach((body, i) => {
      const newBody = bodies[i];

      body.position.x = newBody.x;
      body.position.y = newBody.y;
    });
  };

  //
  //
  //
}
