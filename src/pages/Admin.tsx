import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CarInventoryAdmin } from "@/components/admin/CarInventoryAdmin";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { WishlistAdmin } from "@/components/admin/WishlistAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { AnalyticsAdmin } from "@/components/admin/AnalyticsAdmin";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("admin_authenticated") === "true";
  });

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout onLogout={() => {
      localStorage.removeItem("admin_authenticated");
      setIsAuthenticated(false);
    }}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/inventory" element={<CarInventoryAdmin />} />
        <Route path="/photos" element={<PhotoManager />} />
        <Route path="/wishlist" element={<WishlistAdmin />} />
        <Route path="/settings" element={<SettingsAdmin />} />
        <Route path="/analytics" element={<AnalyticsAdmin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;