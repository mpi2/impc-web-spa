FROM node:24-alpine AS builder

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:mainline-alpine AS runner

# Copy the nginx configuration files
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# From the 'builder' copy the artifacts in 'public' folder to the nginx impc-web-spa folder
COPY --from=builder /usr/src/app/public /usr/share/nginx/html/impc-web-spa

EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
