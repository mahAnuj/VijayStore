import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@shared/schema";
import { Link, useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

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

    addItem(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
          alt={product.name}
          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </Link>
      <div className="p-4">
        <Badge className={`text-xs font-medium px-2 py-1 ${getCategoryColor(product.category)}`}>
          {product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mt-2 mb-2 cursor-pointer hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-blue-600">₹{product.price}</span>
            <span className="text-sm text-gray-500 ml-1">per unit</span>
          </div>
          <Button
            onClick={handleAddToCart}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm"
            disabled={product.stock <= 0}
          >
            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-red-600 mt-2">Only {product.stock} left in stock</p>
        )}
      </div>
    </div>
  );
}
