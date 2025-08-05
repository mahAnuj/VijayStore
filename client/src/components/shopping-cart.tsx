import { X, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";

export default function ShoppingCart() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleCheckout = () => {
    toggleCart();
    setLocation("/checkout");
  };

  const handleQuantityChange = (productId: string, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : currentQuantity - 1;
    updateQuantity(productId, Math.max(0, newQuantity));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={toggleCart}>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Shopping Cart</h3>
          <Button variant="ghost" size="sm" onClick={toggleCart}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-200px)]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
              <Button
                onClick={() => {
                  toggleCart();
                  setLocation("/products");
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-sm text-gray-600">₹{item.price} each</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleQuantityChange(item.id, item.quantity, false)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Badge variant="secondary" className="px-2 py-1">
                        {item.quantity}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleQuantityChange(item.id, item.quantity, true)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 mt-1"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">₹{getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // In a real app, this would open a quote request form
                  alert("Quote request functionality would be implemented here");
                }}
              >
                Request Bulk Quote
              </Button>
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
