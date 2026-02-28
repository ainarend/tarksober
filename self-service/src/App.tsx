import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "@/components/layout/Header";
import Login from "@/pages/Login";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancelled from "@/pages/PaymentCancelled";
import Dashboard from "@/pages/Dashboard";
import LicenseDetail from "@/pages/LicenseDetail";
import NotFound from "@/pages/NotFound";
import AuthGuard from "@/components/layout/AuthGuard";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">
        Liigu põhisisu juurde
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/checkout/:productId" element={<Checkout />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancelled" element={<PaymentCancelled />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard/license/:licenseId"
            element={
              <AuthGuard>
                <LicenseDetail />
              </AuthGuard>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
