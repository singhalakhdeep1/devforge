FROM node:20-alpine

# Install dependencies for mediasoup
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    gcc \
    libc-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3008
EXPOSE 40000-49999/udp
EXPOSE 40000-49999/tcp

CMD ["npm", "start"]
