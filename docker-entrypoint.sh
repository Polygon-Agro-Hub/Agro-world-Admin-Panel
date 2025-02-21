#!/bin/sh

# Replace environment variables in nginx configuration
envsubst '${API_BASE_URL}' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
