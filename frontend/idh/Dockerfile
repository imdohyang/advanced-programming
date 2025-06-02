# Step 1: Build Stage
FROM node:18 AS builder

WORKDIR /app

# 1. 패키지 복사 및 설치
COPY package*.json ./
RUN npm install

# 2. 소스 복사 (원래의 svelte.config.js 포함됨)
COPY . .

# 3. ✅ Netlify용 svelte.config.js를 Docker용으로 덮어쓰기 (순서 중요!)
COPY svelte.config.docker.js ./svelte.config.js

# 4. 빌드
RUN npm run build

# Step 2: Runtime Stage
FROM node:18 AS runner

WORKDIR /app
COPY --from=builder /app .

RUN npm install --omit=dev

EXPOSE 4173
ENV NODE_ENV=production

CMD ["npm", "run", "preview"]
