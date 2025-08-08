import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import AuthErrorHandler from "./components/AuthErrorHandler";
import { AppRouter } from "./config/router.config";
import { AppRoutes } from "./config/routes.config";

function App() {
  return (
    <AuthErrorHandler>
      <AuthProvider>
        <AppRouter>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </AppRouter>
      </AuthProvider>
    </AuthErrorHandler>
  );
}

export default App;
