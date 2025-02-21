# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0
ARG ENVIRONMENT=development

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build --${ENVIRONMENT}

#stage 2
FROM nginx:alpine

# Copy Nginx configuration  (Line added by chalana)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/plantr_care-admin/browser /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
