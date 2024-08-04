import "virtual:uno.css";
import "@unocss/reset/tailwind.css";

import { h, spec, using } from "forest";
import { appStarted } from "./model";
import { button } from "~/shared/ui/button";
import { createEvent, createStore, sample } from "effector";
import { input } from "~/shared/ui/inputs/input";
import { dialog } from "~/shared/ui/dialog";

const inputVal = createStore<string>("");
const inputChanged = createEvent<string>();

sample({
  clock: inputChanged,
  target: inputVal,
});

const openDialogClicked = createEvent();
const isDialogOpen = createStore<boolean>(false);

sample({
  clock: openDialogClicked,
  fn: () => true,
  target: isDialogOpen,
});

const app = () => {
  h("div", () => {
    button({ text: "Button", onClick: openDialogClicked });

    input({ label: "kek", value: inputVal, valueChanged: inputChanged });

    dialog({
      title: "Title",
      children: () => h("span", { text: "span" }),
      isOpen: isDialogOpen,
    });
  });
};

appStarted();

using(document.querySelector<HTMLDivElement>("#app")!, app);
