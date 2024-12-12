export const getBaseUrl = ({ path }: { path: string }) => {
  return runtimeEnv.API_URL + path;
};
