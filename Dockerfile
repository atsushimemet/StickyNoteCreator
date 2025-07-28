FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# すべての依存関係をインストール（ビルド用）
RUN npm ci

# ソースコードをコピー
COPY . .

# TypeScriptコンパイルとビルド
RUN npm run build:all

# 開発依存関係を削除してイメージサイズを削減
RUN npm prune --production

EXPOSE 3000 3001

# 本番環境用のコマンド
CMD ["npm", "start"] 
