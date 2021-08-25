FROM node

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

CMD npx hardhat run scripts/deploy.js --network cryptoSoccer
