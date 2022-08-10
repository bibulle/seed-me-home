# -------------
FROM node:16 AS BUILD

WORKDIR /usr/src

COPY package*.json ./
COPY decorate-angular-cli.js ./
COPY angular.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm install

COPY libs libs
RUN mkdir apps

COPY apps/frontend apps/frontend
COPY apps/backend apps/backend 

RUN npx nx run-many --parallel --target=build --configuration=production --projects=frontend,backend 
#RUN npx nx run frontend:build:production
#RUN npx nx run backend:build:production

# -------------
FROM node:16

WORKDIR /usr/src

COPY package*.json ./
COPY --from=BUILD /usr/src/dist dist/ 

RUN npm ci --omit=dev

ENV PORT=3000
ENV AUTHENT_JWT_SECRET=authent_jwt_secret
#ENV AUTHENT_GOOGLE_CLIENT_ID=

VOLUME ["/frontend"]
VOLUME ["/nas"]
VOLUME ["/downloaded"]
VOLUME ["/progress"]
EXPOSE 3000

CMD mv dist/apps/frontend/* dist/apps/frontend/.htaccess /frontend && node dist/apps/backend/main.js

