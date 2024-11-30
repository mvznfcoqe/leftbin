import { addService } from "@/models/lib/add";
import { info } from "./info";

const init = async () => {
  await addService(info);
};

export { init };
