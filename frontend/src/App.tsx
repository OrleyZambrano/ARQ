import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { PropertiesPage } from "./pages/PropertiesPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
