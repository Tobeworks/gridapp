FROM node:lts AS build
WORKDIR /app

# Kopiere erst nur die package Dateien
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Dann den Rest der Dateien kopieren
COPY . .

# Build durchführen
RUN npm run build

# Nginx Stage
FROM nginx:alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html