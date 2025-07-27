import React, { useState } from 'react';
import { Book, DEFAULT_PLATFORMS, Platform, Review } from '../types';

interface BookFormProps {
  onAddBook: (book: Book) => void;
}

const BookForm: React.FC<BookFormProps> = ({ onAddBook }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [reviewStars, setReviewStars] = useState('');
  const [reviewCount, setReviewCount] = useState('');

  const updatePlatform = (index: number, field: keyof Platform, value: string | number) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], [field]: value };
    setPlatforms(newPlatforms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('書籍タイトルを入力してください');
      return;
    }

    const validPlatforms = platforms.filter(p => p.price > 0 && p.url.trim());
    if (validPlatforms.length === 0) {
      alert('少なくとも1つのプラットフォーム情報を入力してください');
      return;
    }

    const review: Review = {
      stars: parseFloat(reviewStars) || 0,
      count: parseInt(reviewCount) || 0
    };

    const book: Book = {
      title: title.trim(),
      author: author.trim(),
      platforms: validPlatforms,
      review
    };

    onAddBook(book);
    
    // フォームをリセット
    setTitle('');
    setAuthor('');
    setPlatforms(DEFAULT_PLATFORMS);
    setReviewStars('');
    setReviewCount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">書籍情報を追加</h2>

      {/* 書籍タイトル */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          書籍タイトル *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="書籍タイトルを入力"
          required
        />
      </div>

      {/* 著者名 */}
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
          著者名
        </label>
        <input
          type="text"
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="著者名を入力"
        />
      </div>

      {/* プラットフォーム情報 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          プラットフォーム情報 *
        </label>
        {platforms.map((platform, index) => (
          <div key={index} className="border rounded-lg p-3 sm:p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {platform.name} - URL
                </label>
                <input
                  type="url"
                  value={platform.url}
                  onChange={(e) => updatePlatform(index, 'url', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="商品URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {platform.name} - 価格
                </label>
                <input
                  type="number"
                  value={platform.price || ''}
                  onChange={(e) => updatePlatform(index, 'price', parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="価格を入力 (円)"
                  min="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Amazonレビュー情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reviewStars" className="block text-sm font-medium text-gray-700">
            Amazon星評価
          </label>
          <input
            type="number"
            id="reviewStars"
            value={reviewStars}
            onChange={(e) => setReviewStars(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="例: 4.4"
            step="0.1"
            min="0"
            max="5"
          />
        </div>
        <div>
          <label htmlFor="reviewCount" className="block text-sm font-medium text-gray-700">
            レビュー数
          </label>
          <input
            type="number"
            id="reviewCount"
            value={reviewCount}
            onChange={(e) => setReviewCount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="例: 241"
            min="0"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        書籍を追加
      </button>
    </form>
  );
};

export default BookForm; 
