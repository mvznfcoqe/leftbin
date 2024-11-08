FROM mcr.microsoft.com/playwright:v1.48.1-noble

WORKDIR /app
COPY . .

RUN npm install --save-dev tsx 

RUN npm install
ENV PORT 9001
EXPOSE 9001

CMD ["npm", "run", "start:prod"]