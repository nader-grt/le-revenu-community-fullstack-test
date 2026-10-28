
# syntax=docker/dockerfile:1

FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --fetch-retries=5 --fetch-timeout=300000

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

