FROM node:8-alpine
MAINTAINER JLL "lelan-j@mgdis.fr"

ENV VERSION 0.1.0

RUN set -x && \
  apk add --no-cache su-exec && \
  mkdir -p /app/src/middlewares && \
  mkdir -p /app/src/utils && \
  mkdir -p /app/config && \
  chown -R node.node /app
# Define working directory
WORKDIR /app

# Provides cached layer for node_modules
ADD package.json /app

# Install dev dependencies, we will remove them later
# We add some dependencies for node-gyp native node_modules
# https://github.com/nodejs/node-gyp
RUN apk add --update --no-cache --virtual .build-dependencies gcc make python && \
    yarn global add node-gyp && \
    # Install npm modules
    yarn install --production --pure-lockfile && \
    # Clean everything
    yarn global remove node-gyp && yarn cache clean && \
    apk del .build-dependencies

ADD config/*.js /app/config/
ADD src/*.js /app/src/
ADD src/middlewares/*.js /app/src/middlewares/
ADD src/utils/*.js /app/src/utils/
ADD *.js /app

EXPOSE 3000

CMD ["node", "server.js"]

