import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { CoinDetail } from './pages/CoinDetail';
import { Alerts } from './pages/Alerts';
import { Portfolio } from './pages/Portfolio';
import { Analytics } from './pages/Analytics';
import { Navigation, Toast } from './components';
import { initializeSocket, closeSocket } from './utils/socket';
import { Button } from './components/shared';
import { LogOut } from 'lucide-react';
import './styles/tailwind.css'

type PageType = 'dashboard' | 'alerts' | 'portfolio' | 'analytics' | 'coin-detail';
type AuthPageType = 'login' | 'register';

function App() {
  const { user, token, initFromStorage, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [authPage, setAuthPage] = useState<AuthPageType>('login');
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [selectedCoinName, setSelectedCoinName] = useState<string | null>(null);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (token) {
      initializeSocket();
      return () => {
        closeSocket();
      };
    }
  }, [token]);

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {authPage === 'login' ? (
          <Login onSwitchToRegister={() => setAuthPage('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthPage('login')} />
        )}
        <Toast />
      </div>
    );
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    if (page !== 'coin-detail') {
      setSelectedCoinId(null);
    }
  };

  const handleCoinSelect = (coinId: string, coinName?: string) => {
    setSelectedCoinId(coinId);
    if (coinName) {
      setSelectedCoinName(coinName);
    }
    setCurrentPage('coin-detail');
  };

  const handleCreateAlert = (coinId: string, coinName: string) => {
    setSelectedCoinId(coinId);
    setSelectedCoinName(coinName);
    setCurrentPage('alerts');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.email}</span>
            <Button
              onClick={() => {
                logout();
                setCurrentPage('dashboard');
              }}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>

        {currentPage === 'dashboard' && (
          <Dashboard onCoinSelect={handleCoinSelect} />
        )}

        {currentPage === 'coin-detail' && selectedCoinId && (
          <CoinDetail
            coinId={selectedCoinId}
            onBack={() => setCurrentPage('dashboard')}
            onCreateAlert={handleCreateAlert}
          />
        )}

        {currentPage === 'alerts' && (
          <Alerts
            selectedCoinId={selectedCoinId || undefined}
            selectedCoinName={selectedCoinName || undefined}
            onBackFromCreate={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'portfolio' && <Portfolio />}

        {currentPage === 'analytics' && <Analytics />}
      </div>

      <Toast />
    </div>
  );
}

export default App;
