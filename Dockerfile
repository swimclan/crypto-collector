FROM node:latest
WORKDIR /opt/node/crypto-collector
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "start" ]