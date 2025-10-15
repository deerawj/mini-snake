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

  constructor() {
    this.interaction = new Interaction(
      this.logic.head,
      this.logic.setVelocity,
      this.logic.setTarget
    );

    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => {
    this.logic.setWidthAndHeight(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight
    );
  };

  async init() {
    await this.app.init({
      backgroundAlpha: 0,
      resizeTo: document.documentElement,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      antialias: false,
      autoStart: false,
    });

    this.app.ticker.maxFPS = 10;
    this.app.start();
    this.app.ticker.add(this.onTick);

    document.body.appendChild(this.app.canvas);
    this.update();
  }

  public onTick = (ticker: Ticker) => {
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

    // Disable;
    // const element = document.elementFromPoint(
    //   this.logic.head.x,
    //   this.logic.head.y
    // ) as HTMLElement | null;

    // if (element?.tagName === "A") {
    //   // Optionally make it focusable if it's not
    //   if (!element.hasAttribute("tabindex")) {
    //     element.setAttribute("tabindex", "-1");
    //   }

    //   element.focus();
    // }
  };
}

(async () => {
  const miniSnakes = new MiniSnakes();
  await miniSnakes.init();
})();
