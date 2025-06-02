FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
COPY .env .env
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18
WORKDIR /app
COPY --from=builder /app /app
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "run", "start:prod"]
