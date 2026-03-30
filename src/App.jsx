import { AuthProvider, useAuth } from './AuthContext';
import AuthForm from './components/AuthForm';
import GameBoard from './GameBoard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <p className="text-zinc-600 tracking-widest uppercase text-sm animate-pulse">
          Loading…
        </p>
      </div>
    );
  }

  return user ? <GameBoard /> : <AuthForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
