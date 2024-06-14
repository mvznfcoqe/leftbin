import { h, text, using } from "forest";
import { appStarted } from "./model";

const app = () => {
  h("div", () => {
    text`Hello world`;
  });
};

appStarted();

using(document.querySelector<HTMLDivElement>("#app")!, app);
