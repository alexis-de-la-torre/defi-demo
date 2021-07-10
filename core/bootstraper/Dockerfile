FROM node:16.4.0-alpine3.11
WORKDIR /app
RUN npm install -g truffle
COPY package.json .
RUN npm install
COPY . .
CMD truffle migrate && truffle test
