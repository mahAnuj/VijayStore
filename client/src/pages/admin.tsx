import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AdminPanel from "@/components/admin-panel";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AdminPanel isOpen={true} onClose={() => window.history.back()} />
      <Footer />
    </div>
  );
}
