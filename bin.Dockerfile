FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /app
COPY . .
RUN npm install

WORKDIR /app/apps/bin

ENV PORT 9001
EXPOSE 9001

CMD ["npm", "run", "start:prod"]
