import { useEffect, useState } from 'react';
import BookForm from './components/BookForm';
import LoginForm from './components/LoginForm';
import OutputDisplay from './components/OutputDisplay';
import PasswordChange from './components/PasswordChange';
import TwoFactorAuth from './components/TwoFactorAuth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Book } from './types';

function AppContent() {
  const { authState, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [formattedOutput, setFormattedOutput] = useState('');

  useEffect(() => {
    // ローカルストレージから書籍データを復元
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleAddBook = (book: Book) => {
    const newBooks = [...books, book];
    setBooks(newBooks);
    localStorage.setItem('books', JSON.stringify(newBooks));
  };

  const handleRemoveBook = (index: number) => {
    const newBooks = books.filter((_, i) => i !== index);
    setBooks(newBooks);
    localStorage.setItem('books', JSON.stringify(newBooks));
  };

  const handleGenerateOutput = async () => {
    try {
      const response = await fetch('/api/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ books }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormattedOutput(data.formattedText);
      } else {
        alert('出力の生成に失敗しました');
      }
    } catch (error) {
      console.error('Error generating output:', error);
      alert('出力の生成に失敗しました');
    }
  };

  // 認証状態に応じて表示を切り替え
  if (!authState.isInitialized) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">読み込み中...</div>;
  }

  if (!authState.isAuthenticated) {
    return <LoginForm />;
  }

  if (authState.requiresPasswordChange) {
    return <PasswordChange />;
  }

  if (authState.isTwoFactorEnabled) {
    return <TwoFactorAuth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">StickyNoteCreator</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
          
          <BookForm onAddBook={handleAddBook} />
        </div>

        {books.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">登録済み書籍</h2>
            <div className="space-y-4">
              {books.map((book, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{book.title}</h3>
                      <p className="text-gray-600">
                        プラットフォーム数: {book.platforms.length} | 
                        レビュー: {book.review.stars}⭐ ({book.review.count}件)
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveBook(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleGenerateOutput}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              出力を生成
            </button>
          </div>
        )}

        {formattedOutput && (
          <OutputDisplay output={formattedOutput} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 
