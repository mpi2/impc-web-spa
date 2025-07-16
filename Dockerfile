FROM node:24-alpine AS builder

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:alpine AS runner
COPY --from=builder /usr/src/app/nginx/nginx.conf /etc/nginx/conf.d
COPY --from=builder /usr/src/app/public /usr/share/nginx/html/impc-web-spa
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
