import { EventCallable } from "effector";
import { h, spec } from "forest";

const baseButtonStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const mediumSize = "h-10 px-4 py-2";
const defaultVariant = "bg-primary text-primary-foreground hover:bg-primary/90";

export const button = ({
  text,
  onClick,
}: {
  text: string;
  onClick?: EventCallable<any>;
}) => {
  return h("button", () => {
    spec({
      text,
      classList: [baseButtonStyles, mediumSize, defaultVariant],
      handler: {
        on: {
          click: onClick,
        },
      },
    });
  });
};
