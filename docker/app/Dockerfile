FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY node_modules ./node_modules

# Rebuild native binaries for Linux Alpine
RUN npm install --include=optional
RUN npm rebuild lightningcss

COPY . .

EXPOSE 3000