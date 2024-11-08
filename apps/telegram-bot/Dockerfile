FROM node:alpine

WORKDIR /app
COPY . .

RUN npm install --save-dev tsx 

RUN npm install
CMD ["npm", "run","start:prod"]