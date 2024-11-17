FROM node:23.1.0

WORKDIR /app
COPY . .

RUN npm install --save-dev tsx 
RUN npm install
RUN npx -y playwright@1.48.1 install --with-deps

ENV PORT 9001
EXPOSE 9001

CMD ["npm", "run", "start:prod"]