import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { PropertiesPage } from "../pages/PropertiesPage";
import { PropertyDetailPage } from "../pages/PropertyDetailPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { AdminPage } from "../pages/AdminPage";
import { BecomeAgentPage } from "../pages/BecomeAgentPage";
import { AgentDashboardPage } from "../pages/AgentDashboardPage";
import { AddPropertyPage } from "../pages/AddPropertyPage";
import { MyPropertiesPage } from "../pages/MyPropertiesPage";
import { EditPropertyPage } from "../pages/EditPropertyPage";
import { PaymentPlansPage } from "../pages/PaymentPlansPage";
import { MyVisitsPage } from "../pages/MyVisitsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/become-agent" element={<BecomeAgentPage />} />
      <Route path="/dashboard" element={<AgentDashboardPage />} />
      <Route path="/agent-dashboard" element={<AgentDashboardPage />} />
      <Route path="/add-property" element={<AddPropertyPage />} />
      <Route path="/my-properties" element={<MyPropertiesPage />} />
      <Route path="/edit-property/:id" element={<EditPropertyPage />} />
      <Route path="/payment-plans" element={<PaymentPlansPage />} />
      <Route path="/my-visits" element={<MyVisitsPage />} />
    </Routes>
  );
}
