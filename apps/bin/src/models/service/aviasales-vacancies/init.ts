import { addService } from "../lib";
import { info } from "./info";

const init = async () => {
  await addService(info);
};

export { init };
