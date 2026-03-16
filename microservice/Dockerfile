FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/data

RUN npm install -g serverless@3

EXPOSE 3001

CMD ["sls", "offline", "--host", "0.0.0.0", "--httpPort", "3001"]
