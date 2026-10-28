
# syntax=docker/dockerfile:1

FROM node:22-alpine

RUN apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    bash \
    vips-dev \
    git

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --fetch-retries=5 --fetch-timeout=300000

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 1337

CMD ["npm", "run", "develop"]
