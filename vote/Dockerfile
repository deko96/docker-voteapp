FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./entrypoint.sh ./

RUN ["chmod", "+x", "./entrypoint.sh"]

ENTRYPOINT sh /app/entrypoint.sh