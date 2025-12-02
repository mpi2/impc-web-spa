FROM node:lts-bookworm AS builder

WORKDIR /usr/src/app
ARG SEARCH_SERVICE_ENABLED=false
ARG API_ROOT="https://nginx.mousephenotype-dev.org/data"
ENV VITE_SEARCH_SERVICE_ENABLED=$SEARCH_SERVICE_ENABLED
ENV VITE_API_ROOT=$API_ROOT
COPY package.json yarn.lock ./
RUN yarn install --immutable
COPY . .
RUN yarn run docker-build

FROM nginx:alpine AS runner

# Create a non-root user to run nginx
RUN adduser -D -H -u 1001 -s /sbin/nologin webuser

# Create app directory and set up nginx
RUN mkdir -p /app/www
# From the 'builder' copy the artifacts in 'public' folder to the nginx impc-web-spa folder
COPY --from=builder /usr/src/app/public /app/www
COPY docker-compose/website-nginx/default.conf /etc/nginx/templates/default.conf.template

# Set correct ownership and permissions for non-root user
RUN chown -R webuser:webuser /app/www && \
    chmod -R 755 /app/www && \
    chown -R webuser:webuser /var/cache/nginx && \
    chown -R webuser:webuser /var/log/nginx && \
    chown -R webuser:webuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R webuser:webuser /var/run/nginx.pid && \
    chmod -R 777 /etc/nginx/conf.d

ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV PORT=8080

EXPOSE $PORT
# Switch to non-root user
USER webuser
CMD ["nginx", "-g", "daemon off;"]
