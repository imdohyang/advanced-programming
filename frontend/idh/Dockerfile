# Step 1: Build Stage
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Production Stage
FROM node:18 AS runner

WORKDIR /app
COPY --from=builder /app .

RUN npm install --omit=dev

EXPOSE 4173
ENV NODE_ENV=production

CMD ["npm", "run", "preview"]
