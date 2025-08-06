import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Shield, Truck } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ShoppingCart from "@/components/shopping-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@shared/schema";
import { Link } from "wouter";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products?id=${id}`],
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      // Redirect to login page
      setLocation("/login");
      return;
    }

    if (product) {
      addItem(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "solenoid-valves": "bg-blue-100 text-blue-800",
      "air-blow-guns": "bg-green-100 text-green-800",
      "pressure-gauges": "bg-yellow-100 text-yellow-800",
      "hydraulic-ball-valves": "bg-purple-100 text-purple-800",
      "air-filter-regulators": "bg-gray-100 text-gray-800",
      "roto-seal-couplings": "bg-indigo-100 text-indigo-800",
      "pressure-switches": "bg-red-100 text-red-800",
      "pneumatic-foot-pedals": "bg-pink-100 text-pink-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Product not found or failed to load.</p>
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Skeleton className="w-full h-96 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20" />
                <Skeleton className="w-20 h-20" />
                <Skeleton className="w-20 h-20" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
                <img
                  src={product.imageUrl || "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-20 h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <Badge className={`mb-2 ${getCategoryColor(product.category)}`}>
                  {product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <Star className="w-5 h-5 text-gray-300" />
                    <a 
                      href="https://www.indiamart.com/vijaytraders-india/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      (4.0 on IndiaMART)
                    </a>
                  </div>
                  <Badge variant="outline">In Stock</Badge>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-3xl font-bold text-blue-600">₹{product.price}</span>
                  <span className="text-gray-500">per unit</span>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
              </div>

              {/* Stock Information */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">Stock Available:</span>
                  <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {product.stock} units
                  </span>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-red-600 text-sm">⚠️ Only {product.stock} left in stock!</p>
                )}
              </div>

              {/* Add to Cart */}
              <div className="mb-8">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg mb-4"
                  disabled={product.stock <= 0}
                >
                  {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-3 text-lg"
                  onClick={() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Request Bulk Quote
                </Button>
              </div>

              {/* Product Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Verified Quality Guarantee</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Fast Wholesale Delivery</span>  
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-700">11+ Years Trusted Supplier</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Product Specifications */}
        {product && (
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">General Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Name:</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">₹{product.price} per unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium">{product.stock} units</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Supplier Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-medium">Vijay Traders</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST Number:</span>
                      <span className="font-medium">09AALFV1464C1Z4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">Delhi Gate, Ghaziabad, UP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">11+ Years</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <ShoppingCart />
    </div>
  );
}
