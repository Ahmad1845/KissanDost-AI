FROM node:22-alpine

WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json ./
RUN npm install

# Copy full-stack source code
COPY . .

# Build Vite production bundle
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npx", "tsx", "server.ts"]
