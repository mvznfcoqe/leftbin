import { Composer } from "grammy";

import { connectHandler } from "./connect";
import type { MyContext } from "../lib/grammy";
import { addBinHandler } from "./add-bin";

const handlers = new Composer<MyContext>();

handlers.use(connectHandler);
handlers.use(addBinHandler);

export { handlers };
