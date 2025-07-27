import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TwoFactorAuth: React.FC = () => {
  const { verifyTwoFactor, generateTwoFactorCode } = useAuth();
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5分

  useEffect(() => {
    // 初回表示時に認証コードを生成
    generateCode();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const generateCode = async () => {
    try {
      const newCode = await generateTwoFactorCode();
      setGeneratedCode(newCode);
      setTimeLeft(300);
    } catch (error) {
      setError('認証コードの生成に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await verifyTwoFactor(code);
      if (!success) {
        setError('認証コードが正しくありません');
      }
    } catch (error) {
      setError('認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            2段階認証
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            認証コードを入力してください
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              認証コード
            </h3>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <code className="text-2xl font-mono text-gray-800 tracking-wider">
                {generatedCode}
              </code>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              このコードは5分間有効です
            </p>
            <p className="text-sm text-gray-500">
              残り時間: {formatTime(timeLeft)}
            </p>
            {timeLeft === 0 && (
              <button
                onClick={generateCode}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                新しいコードを生成
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="sr-only">
                認証コード
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="6桁の認証コードを入力"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || timeLeft === 0}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? '認証中...' : '認証'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth; 
