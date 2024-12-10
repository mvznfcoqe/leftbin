FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install

WORKDIR /app/apps/web

RUN bun run start:build

EXPOSE 8002

# I should change preview to something more serious, but not today
CMD ["bun", "run", "start:preview", "--port", "8002", "--host"]
