FROM node:latest

WORKDIR /app
COPY . .

RUN npm install

WORKDIR /app/apps/telegram-bot

CMD ["npm", "run", "start:prod"]
