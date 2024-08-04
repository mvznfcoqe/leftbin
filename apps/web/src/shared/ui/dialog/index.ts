import { createEvent, sample, StoreWritable } from "effector";
import { h, spec } from "forest";

type DialogProps = {
  isOpen: StoreWritable<boolean>;
  title: string;
  children: () => void;
};

export const dialog = (props: DialogProps) => {
  const { isOpen, title, children } = props;

  const closeDialogClicked = createEvent();

  sample({
    clock: closeDialogClicked,
    fn: () => false,
    target: isOpen,
  });

  h("dialog", () => {
    spec({
      attr: {
        open: isOpen,
      },
    });

    h("button", {
      text: `Close`,
      handler: {
        on: {
          click: closeDialogClicked,
        },
      },
    });

    h("h2", {
      text: title,
    });

    children();
  });
};
