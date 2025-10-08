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

    this.head = new Graphics().rect(0, 0, 5, 5).fill("red");

    this.snakes.addChild(this.head);
    this.interaction = new Interaction(this.logic.setVelocity);

    // this.logic.bodies.forEach((body) => {
    //   //
    // });
  }

  public async init() {
    await this.app.init({ background: "#181616ff", resizeTo: window });

    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    this.app.ticker.add((time) => {
      void time;
      const alteredPieces = this.logic.update();
      // console.log(alteredPieces.head);

      this.head.position.x = alteredPieces.head.x;
      this.head.position.y = alteredPieces.head.y;
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
