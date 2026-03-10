# syntax=docker/dockerfile:1.7

# =========================================================
# Base
# =========================================================
FROM node:20-alpine AS base

WORKDIR /app

# Dependências úteis
RUN apk add --no-cache libc6-compat

# Args padrão
ARG NODE_ENV=development
ARG PORT=3000

# Envs base
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

# =========================================================
# Dependencies
# =========================================================
FROM base AS deps

COPY package*.json ./

RUN npm install

# =========================================================
# Build
# =========================================================
FROM deps AS build

COPY . .

RUN npm run build

# =========================================================
# Production
# =========================================================
FROM node:20-alpine AS prod

WORKDIR /app

RUN apk add --no-cache libc6-compat

ARG NODE_ENV=production
ARG PORT=3000

ARG APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
ARG APPWRITE_PROJECT_ID=seu_project_id_aqui
ARG APPWRITE_API_KEY=sua_api_key_server_aqui
ARG APPWRITE_BUCKET_PRODUCTS=products
ARG APPWRITE_BUCKET_BANNERS=banners

ARG DB_HOST=mysql
ARG DB_PORT=3306
ARG DB_USER=brscience
ARG DB_PASSWORD=app123brscience
ARG DB_NAME=brscience

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

EXPOSE ${PORT}

CMD ["node", "dist/index.js"]