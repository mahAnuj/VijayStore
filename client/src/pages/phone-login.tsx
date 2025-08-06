import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield, Clock } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function PhoneLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { verifyOtpMutation } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest('POST', '/api/auth', { action: 'send-otp', phoneNumber: phone });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setStep('otp');
        setCountdown(60); // 60 second countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify OTP mutation (using the one from useAuth hook)
  const handleVerifyOtpSuccess = (data: any) => {
    if (data.success) {
      toast({
        title: "Success",
        description: "Phone verified successfully!",
      });
      // Use proper navigation instead of window.location.href
      setTimeout(() => {
        setLocation('/');
      }, 1000);
    } else {
      toast({
        title: "Error",
        description: data.message || "Invalid OTP",
        variant: "destructive",
      });
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }
    
    // Use the verifyOtpMutation from useAuth hook
    verifyOtpMutation.mutate(
      { phone: phoneNumber, otpCode: otp },
      {
        onSuccess: handleVerifyOtpSuccess,
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to verify OTP. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    sendOtpMutation.mutate(phoneNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {step === 'phone' ? (
                <Phone className="w-8 h-8 text-blue-600" />
              ) : (
                <Shield className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {step === 'phone' ? 'Sign In' : 'Verify Phone'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Enter your phone number to get started'
                : `Enter the 6-digit code sent to ${phoneNumber}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number (e.g., 9876543210)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your 10-digit mobile number
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={verifyOtpMutation.isPending || otp.length !== 6}
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || sendOtpMutation.isPending}
                    className="text-blue-600"
                  >
                    {countdown > 0 ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Resend in {countdown}s
                      </span>
                    ) : (
                      'Resend OTP'
                    )}
                  </Button>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="w-full text-gray-600"
                >
                  Change Phone Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}