import React from 'react';

interface OutputDisplayProps {
  output: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ output }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert('クリップボードにコピーしました');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('コピーに失敗しました');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">生成された出力</h2>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          コピー
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
          {output}
        </pre>
      </div>
    </div>
  );
};

export default OutputDisplay; 
