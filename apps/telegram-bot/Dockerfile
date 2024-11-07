FROM oven/bun:1

WORKDIR /app
COPY . .

ENV NODE_ENV=production
RUN bun install
ENTRYPOINT [ "bun", "run", "src/index.ts" ]