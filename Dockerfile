FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール（開発用も含む）
RUN npm ci

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

EXPOSE 3000 3001

CMD ["npm", "run", "dev:full"] 
