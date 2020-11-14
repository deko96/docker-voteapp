FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci \
 && npm cache clean --force


COPY ./entrypoint.sh ./

RUN ["chmod", "+x", "./entrypoint.sh"]

ENTRYPOINT sh /app/entrypoint.sh