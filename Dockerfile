# syntax=docker/dockerfile:1.7

# =========================================================
# Base
# =========================================================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# =========================================================
# Dependencies
# =========================================================
FROM base AS deps

COPY package*.json ./
RUN npm install

# =========================================================
# Build stage
# =========================================================
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# =========================================================
# Production stage
# =========================================================
FROM base AS prod

ARG NODE_ENV
ARG PORT

ARG APPWRITE_ENDPOINT
ARG APPWRITE_PROJECT_ID
ARG APPWRITE_API_KEY
ARG APPWRITE_BUCKET_PRODUCTS
ARG APPWRITE_BUCKET_BANNERS

ARG DB_HOST
ARG DB_PORT
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

ENV APPWRITE_ENDPOINT=${APPWRITE_ENDPOINT}
ENV APPWRITE_PROJECT_ID=${APPWRITE_PROJECT_ID}
ENV APPWRITE_API_KEY=${APPWRITE_API_KEY}
ENV APPWRITE_BUCKET_PRODUCTS=${APPWRITE_BUCKET_PRODUCTS}
ENV APPWRITE_BUCKET_BANNERS=${APPWRITE_BUCKET_BANNERS}

ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_NAME=${DB_NAME}

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

RUN printf "NODE_ENV=%s\nPORT=%s\nAPPWRITE_ENDPOINT=%s\nAPPWRITE_PROJECT_ID=%s\nAPPWRITE_API_KEY=%s\nAPPWRITE_BUCKET_PRODUCTS=%s\nAPPWRITE_BUCKET_BANNERS=%s\nDB_HOST=%s\nDB_PORT=%s\nDB_USER=%s\nDB_PASSWORD=%s\nDB_NAME=%s\n" \
  "$NODE_ENV" \
  "$PORT" \
  "$APPWRITE_ENDPOINT" \
  "$APPWRITE_PROJECT_ID" \
  "$APPWRITE_API_KEY" \
  "$APPWRITE_BUCKET_PRODUCTS" \
  "$APPWRITE_BUCKET_BANNERS" \
  "$DB_HOST" \
  "$DB_PORT" \
  "$DB_USER" \
  "$DB_PASSWORD" \
  "$DB_NAME" \
  > /app/dist/.env \
  && echo "===== /app =====" \
  && ls -la /app \
  && echo "===== /app/dist =====" \
  && ls -la /app/dist \
  && echo "===== .env criado =====" \
  && cat /app/dist/.env

EXPOSE ${PORT}

CMD ["node", "dist/index.js"]