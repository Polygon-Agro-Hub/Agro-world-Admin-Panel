# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine as builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

RUN npm i force

COPY . .

RUN npm run build --prod

#stage 2
FROM nginx:alpine

# Copy Nginx configuration  (Line added by chalana)
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/plantr_care-admin/browser /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
