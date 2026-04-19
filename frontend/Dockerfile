FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set the API URL to the backend service on BuildWithLocus
ENV VITE_API_URL=https://svc-mo5hjvzkpe6ptqz1.buildwithlocus.com/api

RUN npm run build

# Serve with a lightweight static server
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
