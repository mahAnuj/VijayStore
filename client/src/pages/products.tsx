import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Search, Filter } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import ShoppingCart from "@/components/shopping-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";

export default function Products() {
  const params = useParams();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Extract search params from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const search = urlParams.get('search');
    const category = params.category;
    
    if (search) {
      setSearchQuery(search);
    }
    if (category) {
      setSelectedCategory(category);
    }
  }, [location, params.category]);

  // Build query key based on search and category
  const queryKey = ["/api/products"];
  const queryParams = new URLSearchParams();
  
  if (searchQuery) {
    queryParams.append("search", searchQuery);
  }
  if (selectedCategory) {
    queryParams.append("category", selectedCategory);
  }
  
  const fullQueryKey = queryParams.toString() 
    ? `${queryKey[0]}?${queryParams.toString()}`
    : queryKey[0];

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [fullQueryKey],
  });

  const categories = [
    { value: "", label: "All Categories" },
    { value: "solenoid-valves", label: "Solenoid Valves" },
    { value: "air-blow-guns", label: "Air Blow Guns" },
    { value: "pressure-gauges", label: "Pressure Gauges" },
    { value: "hydraulic-ball-valves", label: "Hydraulic Ball Valves" },
    { value: "air-filter-regulators", label: "Air Filter Regulators" },
    { value: "roto-seal-couplings", label: "Roto Seal Couplings" },
    { value: "pressure-switches", label: "Pressure Switches" },
    { value: "pneumatic-foot-pedals", label: "Pneumatic Foot Pedals" },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategory) params.append("category", selectedCategory);
    
    const queryString = params.toString();
    window.history.pushState({}, "", `/products${queryString ? `?${queryString}` : ""}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (category) params.append("category", category);
    
    const queryString = params.toString();
    window.history.pushState({}, "", `/products${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {selectedCategory 
              ? categories.find(c => c.value === selectedCategory)?.label || "Products"
              : searchQuery 
                ? `Search Results for "${searchQuery}"`
                : "All Products"
            }
          </h1>
          <p className="text-gray-600">
            Browse our comprehensive range of industrial pneumatic and hydraulic equipment
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="md:w-64 h-12">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(category => category.value !== "").map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load products. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {isLoading ? "Loading..." : `${products?.length || 0} product${products?.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <Skeleton className="w-full h-48" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </div>
                  ))
                : products?.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your search terms or browse all categories.
                      </p>
                      <Button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("");
                          window.history.pushState({}, "", "/products");
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View All Products
                      </Button>
                    </div>
                  ) : (
                    products?.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  )}
            </div>
          </>
        )}
      </div>

      <Footer />
      <ShoppingCart />
    </div>
  );
}
