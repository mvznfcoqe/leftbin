FROM mcr.microsoft.com/playwright:v1.48.1-noble

WORKDIR /app
COPY . .

RUN apt update
RUN apt install unzip
RUN curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr bash

RUN bun install
CMD ["bun", "dev"]
EXPOSE 3001