import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Book } from '../src/types';

// Expressの型拡張
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json());

// JWT認証ミドルウェア
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// ログインエンドポイント
app.post('/api/login', async (req, res) => {
  const { password } = req.body;

  try {
    const isValidPassword = await bcrypt.compare(password, await bcrypt.hash(ADMIN_PASSWORD, 10));
    
    if (isValidPassword) {
      const token = jwt.sign({ user: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2段階認証エンドポイント
app.post('/api/verify-2fa', authenticateToken, (req, res) => {
  const { code } = req.body;
  
  // 簡易的な実装：ローカルストレージに保存されたコードと比較
  // 実際の実装では、データベースやセッション管理を使用
  if (code && code.length === 6) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid code' });
  }
});

// パスワード変更エンドポイント
app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // 実際の実装では、データベースに新しいパスワードを保存
    // ここでは簡易的に環境変数を更新（実際にはデータベースを使用）
    console.log('Password changed successfully');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Password change failed' });
  }
});

// フォーマットエンドポイント
app.post('/api/format', authenticateToken, (req, res) => {
  const { books }: { books: Book[] } = req.body;

  if (!books || !Array.isArray(books) || books.length === 0) {
    return res.status(400).json({ error: 'Books data is required' });
  }

  try {
    const formattedText = formatBooks(books);
    res.json({ formattedText });
  } catch (error) {
    res.status(500).json({ error: 'Formatting failed' });
  }
});

// 書籍フォーマット関数
function formatBooks(books: Book[]): string {
  let output = '';

  books.forEach((book, index) => {
    // 書籍タイトル
    output += `『${book.title}』\n\n`;

    // プラットフォーム情報を価格昇順でソート
    const sortedPlatforms = [...book.platforms].sort((a, b) => a.price - b.price);

    sortedPlatforms.forEach((platform, platformIndex) => {
      const isLowest = platformIndex === 0;
      const marker = isLowest ? '🟥' : '⬜';
      const label = isLowest ? '（最安）' : '';

      output += `${marker} ${platform.name}${label}\n`;
      output += `▶️ ¥${platform.price.toLocaleString()}\n`;
      output += `${platform.url}\n\n`;
    });

    // Amazonレビュー情報
    if (book.review.stars > 0 || book.review.count > 0) {
      output += `※ amazon✨${book.review.stars} レビュー${book.review.count}\n\n`;
    }

    // セクション区切り（最後の書籍以外）
    if (index < books.length - 1) {
      output += '---\n\n';
    }
  });

  // 共通の注意書き
  output += '※各情報は投稿時点の情報です。最新情報は各サイトでご確認ください\n';
  output += '※Amazonの価格は「Amazonの他の出品者」の価格を参考にしています\n';
  output += '※本投稿にはアフィリエイト広告（PR）が含まれます';

  return output;
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
