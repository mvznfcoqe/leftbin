import "../env/runtime-env.js";

const target = new URL("/swagger/json", runtimeEnv.API_URL).href;

export default {
  internal: {
    output: {
      client: "zod",
      mode: "single",
      target: "../../api/internal/schema.generated.ts",
    },

    input: {
      target,
    },
  },
};
