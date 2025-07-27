import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthState } from '../types';

interface AuthContextType {
  authState: AuthState;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  generateTwoFactorCode: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false,
    isAuthenticated: false,
    isTwoFactorEnabled: false,
    requiresPasswordChange: false,
  });

  useEffect(() => {
    // 初期化時にローカルストレージから認証状態を復元
    const token = localStorage.getItem('authToken');
    const isInitialized = localStorage.getItem('isInitialized') === 'true';
    const requiresPasswordChange = localStorage.getItem('requiresPasswordChange') === 'true';
    
    // 初回アクセス時は初期化フラグを設定
    if (!isInitialized) {
      localStorage.setItem('isInitialized', 'true');
    }
    
    setAuthState({
      isInitialized: true, // 常にtrueに設定
      isAuthenticated: !!token,
      isTwoFactorEnabled: false,
      requiresPasswordChange: requiresPasswordChange,
    });
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      // 初回パスワードまたは設定済みパスワードと比較
      const savedPassword = localStorage.getItem('adminPassword');
      const isFirstLogin = !savedPassword;
      
      let isValidPassword = false;
      
      if (isFirstLogin) {
        // 初回ログイン：環境変数のパスワードと比較
        isValidPassword = password === 'z95dt8bra4mlful3q53zx';
      } else {
        // 2回目以降：保存されたパスワードと比較
        isValidPassword = password === savedPassword;
      }

      if (isValidPassword) {
        // 簡易的なトークン生成
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('authToken', token);
        
        if (isFirstLogin) {
          localStorage.setItem('requiresPasswordChange', 'true');
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            isInitialized: true,
            requiresPasswordChange: true,
          }));
        } else {
          // 2回目以降のログインは2段階認証が必要
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            isTwoFactorEnabled: true,
          }));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('twoFactorCode');
    setAuthState({
      isInitialized: true,
      isAuthenticated: false,
      isTwoFactorEnabled: false,
      requiresPasswordChange: false,
    });
  };

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    try {
      // ローカルストレージから保存されたコードを取得
      const savedCodeData = localStorage.getItem('twoFactorCode');
      if (!savedCodeData) {
        return false;
      }

      const { code: savedCode, expiresAt } = JSON.parse(savedCodeData);
      
      // 有効期限チェック
      if (Date.now() > expiresAt) {
        localStorage.removeItem('twoFactorCode');
        return false;
      }

      // コード比較
      if (code === savedCode) {
        localStorage.removeItem('twoFactorCode');
        setAuthState(prev => ({
          ...prev,
          isTwoFactorEnabled: false,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      // 簡易的な実装：ローカルストレージに新しいパスワードを保存
      // 実際の実装では、サーバーに送信してデータベースに保存
      localStorage.setItem('adminPassword', newPassword);
      localStorage.setItem('requiresPasswordChange', 'false');
      
      setAuthState(prev => ({
        ...prev,
        requiresPasswordChange: false,
      }));
      
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  };

  const generateTwoFactorCode = async (): Promise<string> => {
    const code = Math.random().toString().substring(2, 8);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5分間有効
    
    localStorage.setItem('twoFactorCode', JSON.stringify({ code, expiresAt }));
    return code;
  };

  const value: AuthContextType = {
    authState,
    login,
    logout,
    verifyTwoFactor,
    changePassword,
    generateTwoFactorCode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
