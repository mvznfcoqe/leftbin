FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install

WORKDIR /app/apps/telegram-bot

CMD ["bun", "run", "start:prod"]
