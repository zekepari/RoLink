FROM node:latest

WORKDIR /RoLinker

COPY package*.json ./
RUN npm install

COPY . /RoLinker

CMD ["node", "./index.js"]