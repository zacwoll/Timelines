# Base image
FROM node:14-alpine

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production

# Bundle app source
COPY . .

# Expose the default port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
