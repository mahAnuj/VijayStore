import { useState } from "react";
import Header from "@/components/header";
import Hero from "@/components/hero";
import TrustIndicators from "@/components/trust-indicators";
import FeaturedProducts from "@/components/featured-products";
import ProductCategories from "@/components/product-categories";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import ShoppingCart from "@/components/shopping-cart";
import AdminPanel from "@/components/admin-panel";
import Footer from "@/components/footer";

export default function Home() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <TrustIndicators />
      <FeaturedProducts />
      <ProductCategories />
      <AboutSection />
      <ContactSection />
      <Footer />
      <ShoppingCart />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
