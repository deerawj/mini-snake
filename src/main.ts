import { OfflineLogic } from "./OfflineLogic";
import { Interaction } from "./Interaction";
import { Application, Ticker } from "pixi.js";
import { Renderer } from "./Renderer";

export class MiniSnakes {
  private app: Application = new Application();

  private logic: OfflineLogic = new OfflineLogic(
    window.innerWidth,
    window.innerHeight
  );
  private interaction: Interaction;
  private renderer: Renderer = new Renderer(this.app);
  private timeSinceLastUpdate = 0;

  constructor() {
    this.interaction = new Interaction(
      this.logic.head,
      this.logic.setVelocity,
      this.logic.setTarget
    );
  }

  async init() {
    await this.app.init({
      resizeTo: window,
      antialias: false,
      backgroundAlpha: 0.0,
    });

    this.app.ticker.add(this.onTick);

    document.body.appendChild(this.app.canvas);
    this.update();
  }

  public onFetch = () => {
    //
  };

  public onTick = (ticker: Ticker) => {
    this.timeSinceLastUpdate += ticker.deltaMS;

    if (this.timeSinceLastUpdate < 100) {
      return;
    }

    this.timeSinceLastUpdate = 0;
    this.update();
  };

  public update = () => {
    this.logic.update();

    this.renderer.set(
      this.logic.head,
      this.logic.bodies,
      this.logic.normalfood,
      this.logic.specialFood,
      this.logic.poisonFood
    );

    const element = document.elementFromPoint(
      this.logic.head.x,
      this.logic.head.y
    ) as HTMLElement | null;

    if (element?.tagName === "A") {
      // Optionally make it focusable if it's not
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "-1");
      }

      element.focus();
    }
  };
}

(async () => {
  const miniSnakes = new MiniSnakes();
  await miniSnakes.init();
})();
