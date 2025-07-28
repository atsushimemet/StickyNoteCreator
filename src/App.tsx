import { useEffect, useState } from 'react';
import BookForm from './components/BookForm';
import LoginForm from './components/LoginForm';
import OutputDisplay from './components/OutputDisplay';
import PasswordChange from './components/PasswordChange';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Book, PostData } from './types';

function AppContent() {
  const { authState, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [postTitle, setPostTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [formattedOutput, setFormattedOutput] = useState('');

  useEffect(() => {
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }
  }, []);

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
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('認証トークンが見つかりません。再度ログインしてください。');
        return;
      }

      const postData: PostData = {
        postTitle,
        targetAudience,
        books
      };

      const response = await fetch('/api/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const data = await response.json();
        setFormattedOutput(data.formattedText);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        alert(`出力の生成に失敗しました: ${errorData.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Error generating output:', error);
      alert('出力の生成に失敗しました');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Conditional rendering based on authState
  if (!authState.isInitialized) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">読み込み中...</div>;
  }

  if (!authState.isAuthenticated) {
    return <LoginForm />;
  }

  if (authState.requiresPasswordChange) {
    return <PasswordChange />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">StickyNoteCreator</h1>
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-shrink-0"
              title="ログアウト"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <BookForm onAddBook={handleAddBook} />
        </div>

        {books.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">登録済み書籍</h2>
            <div className="space-y-4">
              {books.map((book, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{book.title}</h3>
                      {book.author && (
                        <p className="text-gray-500 text-sm">著者: {book.author}</p>
                      )}
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

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  投稿タイトル *
                </label>
                <input
                  type="text"
                  id="postTitle"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="投稿のタイトルを入力"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  こんな人に読んでもらいたい
                </label>
                <textarea
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="例：プログラミング初心者、ビジネス書を読む習慣のある方、など"
                />
              </div>

              <button
                onClick={handleGenerateOutput}
                disabled={!postTitle.trim()}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  postTitle.trim() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                出力を生成
              </button>
            </div>
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
