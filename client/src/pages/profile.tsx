import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, MapPin, Package, Plus, Edit, Trash2 } from "lucide-react";
import type { CustomerProfile, CustomerAddress, Order, User } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [profileData, setProfileData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    gst: "",
  });
  const [addressData, setAddressData] = useState({
    label: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user profile
  const { data: profile } = useQuery<CustomerProfile>({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  // Fetch user addresses
  const { data: addresses = [] } = useQuery<CustomerAddress[]>({
    queryKey: ["/api/addresses"],
    enabled: isAuthenticated,
  });

  // Fetch user orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders?action=my-orders"],
    enabled: isAuthenticated,
  });

  // Update profile data when profile loads
  useEffect(() => {
    setProfileData({
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: profile?.phone || user?.phone || "",
      company: profile?.company || "",
      gst: profile?.gst || "",
    });
  }, [profile, user]);

  // Profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      // Always use PUT since user must exist to be authenticated
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditingProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Address mutation
  const addressMutation = useMutation({
    mutationFn: async (data: typeof addressData) => {
      return await apiRequest("POST", "/api/addresses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setIsAddingAddress(false);
      setAddressData({
        label: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isDefault: false,
      });
      toast({
        title: "Success",
        description: "Address added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSaveProfile = () => {
    profileMutation.mutate(profileData);
  };

  const handleSaveAddress = () => {
    addressMutation.mutate(addressData);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your profile, addresses, and orders</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Information
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label>GST Number</Label>
                    <Input
                      value={profileData.gst}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gst: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Enter GST number"
                    />
                  </div>
                </div>
                
                {isEditingProfile && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={profileMutation.isPending}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Saved Addresses
                  <Button size="sm" onClick={() => setIsAddingAddress(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAddingAddress && (
                  <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <h3 className="font-medium mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="label">Address Label</Label>
                        <Input
                          id="label"
                          value={addressData.label}
                          onChange={(e) => setAddressData({ ...addressData, label: e.target.value })}
                          placeholder="Home, Office, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode" 
                          value={addressData.pincode}
                          onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                          placeholder="400001"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addressLine1">Address Line 1</Label>
                        <Input
                          id="addressLine1"
                          value={addressData.addressLine1}
                          onChange={(e) => setAddressData({ ...addressData, addressLine1: e.target.value })}
                          placeholder="House/Building number, Street"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                        <Input
                          id="addressLine2"
                          value={addressData.addressLine2}
                          onChange={(e) => setAddressData({ ...addressData, addressLine2: e.target.value })}
                          placeholder="Area, Locality"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={addressData.city}
                          onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={addressData.state}
                          onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                          placeholder="Maharashtra"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={handleSaveAddress} 
                        disabled={addressMutation.isPending}
                      >
                        Save Address
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingAddress(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                {addresses.length === 0 && !isAddingAddress ? (
                  <p className="text-gray-500 text-center py-8">No addresses saved yet</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{address.label || "Address"}</h3>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600">{address.country}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders placed yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <p className="text-lg font-semibold mt-2">₹{order.totalAmount}</p>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} × {item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}