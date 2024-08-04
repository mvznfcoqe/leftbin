import { createEvent, EventCallable, sample, Store } from "effector";
import { h, spec } from "forest";

type InputProps = {
  label: string;

  value: Store<string>;
  valueChanged: EventCallable<string>;

  required?: boolean;
  disabled?: boolean;
};

export const input = (props: InputProps) => {
  const {
    label,
    value,
    valueChanged,
    required = true,
    disabled = false,
  } = props;

  h("div", () => {
    spec({
      classList: ["flex flex-col gap-1"],
    });

    h("label", () => {
      spec({
        text: required ? `${label}*` : label,
        attr: {
          for: label,
        },
      });
    });

    h("input", () => {
      const inputChanged = createEvent<Event>();

      sample({
        clock: inputChanged,
        fn: (changeEvent) => {
          return (changeEvent.target as HTMLInputElement).value;
        },
        target: [valueChanged],
      });

      spec({
        classList: [
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        ],
        attr: {
          disabled: disabled,
          value: value,
          id: label,
        },
        handler: {
          on: {
            input: inputChanged,
          },
        },
      });
    });
  });
};
