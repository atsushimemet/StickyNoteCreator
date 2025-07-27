FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScriptコンパイルとビルド
RUN npm run build:all

EXPOSE 3001

# 本番環境用のコマンド
CMD ["npm", "start"] 
