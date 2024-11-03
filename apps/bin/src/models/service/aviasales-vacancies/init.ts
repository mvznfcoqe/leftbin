import { addService } from "@/models/lib/add";
import { info } from "./info";

const init = async () => {
  return await addService(info);
};

export { init };
