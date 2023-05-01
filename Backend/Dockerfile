# Stage 1: Build
FROM node:14 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Release
FROM node:14

WORKDIR /app

COPY --from=build /app/built /app/built
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
