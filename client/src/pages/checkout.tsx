import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "Error",
        description: "Please fill in all customer information fields.",
        variant: "destructive",  
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      const paymentRes = await apiRequest("POST", "/api/payments/create-order", {
        amount: getTotalPrice(),
      });
      const paymentResponse = await paymentRes.json();

      if (!paymentResponse?.orderId) {
        throw new Error("Failed to create payment order");
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => initializeRazorpay(paymentResponse);
        document.body.appendChild(script);
      } else {
        initializeRazorpay(paymentResponse);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const initializeRazorpay = (paymentData: any) => {
    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "Vijay Traders",
      description: "Industrial Equipment Purchase",
      order_id: paymentData.orderId,
      handler: async (response: any) => {
        try {
          // Verify payment
          await apiRequest("POST", "/api/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Create order in database
          const orderData = {
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            customerAddress: customerInfo.address,
            items: items.map((item: any) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            totalAmount: getTotalPrice().toString(),
            paymentOrderId: response.razorpay_order_id,
            status: "paid",
          };

          await apiRequest("POST", "/api/orders", orderData);

          clearCart();
          toast({
            title: "Success",
            description: "Payment successful! Your order has been placed.",
          });
          setLocation("/?payment=success");
        } catch (error: any) {
          console.error("Order creation error:", error);
          toast({
            title: "Error",
            description: "Payment successful but order creation failed. Please contact support.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      toast({
        title: "Payment Failed",
        description: response.error.description || "Payment failed. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    });

    rzp.open();
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Full Name *"
              value={customerInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email Address *"
              value={customerInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>
          <Input
            type="tel"
            placeholder="Phone Number *"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            required
          />
          <Textarea
            placeholder="Delivery Address *"
            value={customerInfo.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            You will be redirected to Razorpay's secure payment gateway to complete your payment.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Accepted Payment Methods:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Credit/Debit Cards (Visa, MasterCard, RuPay)</li>
              <li>• Net Banking</li>
              <li>• UPI (PhonePe, Google Pay, Paytm)</li>
              <li>• Digital Wallets</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handlePayment}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg"
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : `Pay ₹${getTotalPrice().toFixed(2)}`}
      </Button>
    </div>
  );
};

export default function Checkout() {
  const { items, getTotalPrice } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    setLocation("/products");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <CheckoutPage />
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-gray-600 text-sm">₹{item.price} × {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>🔒</span>
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>🚚</span>
                <span>Fast wholesale delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>📞</span>
                <span>Customer support available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
