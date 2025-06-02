# Step 1: Build Stage
FROM node:18 AS builder

WORKDIR /app

# ✅ 1. package.json, lock만 복사 (idh 디렉토리 안에 있음)
COPY ./package*.json ./

# ✅ 2. adapter-node 포함된 패키지 설치
RUN npm install

# ✅ 3. 전체 소스 복사 (idh 내부 기준)
COPY . .

# ✅ 4. Docker용 config로 덮어쓰기 (순서 중요!)
COPY svelte.config.docker.js ./svelte.config.js

# ✅ 5. 빌드
RUN npm run build

# Step 2: Runtime Stage
FROM node:18 AS runner

WORKDIR /app

COPY --from=builder /app .

RUN npm install

EXPOSE 4173
ENV NODE_ENV=production

CMD ["npm", "run", "preview"]
