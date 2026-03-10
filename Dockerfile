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

EXPOSE ${PORT}

CMD ["node", "server.js"]