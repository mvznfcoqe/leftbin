FROM node:latest

WORKDIR /app
COPY . .
RUN npm install
RUN npx -y playwright@1.48.1 install --with-deps

WORKDIR /app/apps/bin

ENV PORT 9001
EXPOSE 9001

CMD ["npm", "run", "start:prod"]
