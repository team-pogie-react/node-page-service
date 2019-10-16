FROM node:10-alpine AS builder

WORKDIR /home/node/app

COPY . .

RUN npm install && npm run build


# Build production image
FROM node:10-alpine

LABEL maintainer="usautoparts.com"

ENV UV_THREADPOOL_SIZE=100 \
  NODE_ENV=production \
  NPM_CONFIG_LOGLEVEL=error \
  WORK_DIR=/home/node/app \
  ENABLE_LOGGING=1 \
  HTTP_CLIENT_TIMEOUT=30000 \
  HTTP_CLIENT_RETRIES=0 \
  CACHE_DRIVER=null \
  CACHE_PREFIX= \
  NEW_RELIC_APP_NAME= \
  NEW_RELIC_LICENSE_KEY= \
  URL_GATEWAY= \
  CP_BASE_IMAGE_URL= \
  IMAGE_SOURCE= \
  LOGIN_ID= \
  VIDEO_API_BASE_URL= \
  VIDEO_JS_BASE_URL= \
  CHANNELS= \
  RESELLER_RATING_URL= \
  RESELLER_RATING_API_URL= \
  CP_RESELLER_RATING_ID= \
  CP_RESELLER_RATING_API_VERSION= \
  CP_RESELLER_RATING_GRANT_TYPE= \
  CP_RESELLER_RATING_CLIENT_ID= \
  CP_RESELLER_RATING_CLIENT_SECRET= \
  BLOG_API_URL= \
  BLOG_BASE_URL=

# Add dumb-init
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 /usr/local/bin/dumb-init

WORKDIR ${WORK_DIR}

RUN mkdir ${WORK_DIR} -p && \
  chown -R node:node ${WORK_DIR}  /usr/local/ && \
  chmod 0755 ${WORK_DIR} -R && \
  chmod +x /usr/local/bin/dumb-init

USER node:node

COPY ./package* ./
RUN npm install --production

COPY --from=builder ${WORK_DIR}/dist  ./dist
COPY ./newrelic.js ./newrelic.js

EXPOSE 3000

CMD [ "/usr/local/bin/dumb-init", "npm", "run", "serve" ]
