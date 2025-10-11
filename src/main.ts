import { OfflineLogic } from "./OfflineLogic";
import { Interaction } from "./Interaction";
import { Application, Ticker } from "pixi.js";
import { Renderer } from "./Renderer";

export class MiniSnakes {
  private app: Application = new Application();

  private logic: OfflineLogic = new OfflineLogic(
    document.documentElement.clientWidth,
    document.documentElement.clientHeight
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

    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => {
    this.logic.width = document.documentElement.clientWidth;
    this.logic.height = document.documentElement.clientHeight;
  };

  async init() {
    await this.app.init({
      backgroundAlpha: 0.0,
      resizeTo: document.documentElement,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      antialias: false,
    });

    this.app.ticker.add(this.onTick);

    document.body.appendChild(this.app.canvas);
    this.update();
  }

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
      this.logic.poisonFood,
      this.logic.exactHead
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
