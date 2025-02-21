# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine AS builder

ARG ENVIRONMENT=development

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build -- --configuration=${ENVIRONMENT}

FROM nginx:alpine

# Copy nginx configuration as a template
COPY nginx.conf /etc/nginx/conf.d/default.template

# Copy the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=builder /app/dist/plantr_care-admin/browser /usr/share/nginx/html

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
