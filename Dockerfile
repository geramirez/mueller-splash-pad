FROM node:16-alpine

# Create app directories
WORKDIR /usr/src/app
RUN : \
    && mkdir -p /usr/src/app/knex \
    && mkdir -p /usr/src/app/server \
    && mkdir -p /usr/src/app/client

# Install app dependencies
COPY ./knex/package*.json ./knex
COPY ./server/package*.json ./server
COPY ./client/package*.json ./client

RUN : \
    && cd knex \
    && npm install \
    && cd ../server \
    && npm install \
    && cd ../client \
    && npm install

# Bundle app source
COPY ./knex ./knex
COPY ./server ./server
COPY ./client ./client

# TODO - maybe we should use something like https://pnpm.io/ to DRY things up

CMD [ "node", "server/index.js" ]
