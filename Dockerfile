FROM node:17-slim

RUN apt-get update &&\
 apt-get install -y sox libsox-fmt-mp3

WORKDIR /spot-clone/

COPY package.json package-lock.json /spot-clone/

RUN npm ci --silent

COPY . .

USER node

CMD npm run live-reload
