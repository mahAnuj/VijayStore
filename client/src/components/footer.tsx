import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Vijay Traders</h3>
            <p className="text-gray-300 mb-4">
              Your trusted partner for industrial pneumatic and hydraulic
              equipment since 2014. We specialize in wholesale trading of
              high-quality industrial components.
            </p>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-600 hover:bg-green-700">
                GST Verified
              </Badge>
              <Badge className="bg-orange-600 hover:bg-orange-700">
                11+ Years
              </Badge>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <a
                  href="https://www.indiamart.com/vijaytraders-india/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-blue-600 transition-colors"
                >
                  4.0 on IndiaMART
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-white"
                >
                  Products
                </Link>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-gray-300">
              <p>
                <i className="fas fa-map-marker-alt mr-2"></i>Delhi Gate,
                Ghaziabad, UP
              </p>
              <p>
                <i className="fas fa-file-invoice mr-2"></i>GST: 09AALFV1464C1Z4
              </p>
              <p>
                <i className="fas fa-briefcase mr-2"></i>Partnership Firm
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2025 Vijay Traders. All rights reserved. | Wholesale Trader
            of Industrial Pneumatic & Hydraulic Equipment
          </p>
        </div>
      </div>
    </footer>
  );
}
