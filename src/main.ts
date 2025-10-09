import { Application, Graphics, Container } from "pixi.js";
import { OfflineLogic } from "./OfflineLogic";
import { Interaction } from "./Interaction";

export class MiniSnakes {
  private app: Application;
  private logic: OfflineLogic;
  private snakes: Container = new Container();
  private interaction: Interaction;
  private head: Graphics;

  constructor() {
    this.app = new Application();
    this.app.stage.addChild(this.snakes);

    this.logic = new OfflineLogic(window.innerWidth, window.innerHeight);

    this.head = new Graphics().rect(0, 0, 10, 10).fill("red");
    this.snakes.addChild(this.head);
    this.interaction = new Interaction(this.logic.head, this.logic.setVelocity);
  }

  public async init() {
    await this.app.init({
      resizeTo: window,
      antialias: false,
      backgroundAlpha: 0.0,
    });

    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    let timeSinceLastUpdate = 0;

    this.app.ticker.add((time) => {
      timeSinceLastUpdate += time.deltaMS;

      if (timeSinceLastUpdate < 25) {
        return;
      }

      timeSinceLastUpdate = 0;

      const alteredPieces = this.logic.update();

      this.head.position.x = alteredPieces.head.x;
      this.head.position.y = alteredPieces.head.y;

      this.snakes.removeChildren();

      this.logic.bodies.forEach((body) => {
        this.snakes.addChild(
          new Graphics().circle(body.x, body.y, 6).fill("gray")
        );
      });

      this.snakes.addChild(
        new Graphics()
          .circle(this.head.position.x, this.head.position.y, 6)
          .fill("red")
      );

      this.head = new Graphics().circle(0, 0, 7).fill("red");
    });
  }

  // Receives all snakes and bodies from the server
  // private onSnakesFull(snakes: Array<Snake>) {
  //   //
  // }
}

(async () => {
  const miniSnakes = new MiniSnakes();
  await miniSnakes.init();
})();
