FROM node:latest

ARG NPM_TOKEN

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN
RUN npm install

# Bundle app source
COPY . /usr/src/app
RUN npm run build

CMD ["npm", "start"]
