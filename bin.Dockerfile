FROM oven/bun:latest AS app

RUN apt-get update && apt-get install curl gnupg -y 
RUN curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - 
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' 
RUN apt-get update 
RUN apt-get install google-chrome-stable -y --no-install-recommends 
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN bun install

WORKDIR /app/apps/bin

ENV PORT=9001
EXPOSE 9001

CMD ["bun", "run", "start:prod"]
