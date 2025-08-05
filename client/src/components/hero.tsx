import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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

  return (
    <section className="relative">
      <div
        className="h-96 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 64, 175, 0.8), rgba(30, 64, 175, 0.8)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`,
        }}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Trusted Partner for Industrial Pneumatic & Hydraulic
                Equipment
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Established in 2014, Vijay Traders is a recognized wholesale
                trader specializing in high-quality pneumatic and hydraulic
                solutions for industrial applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
                  onClick={() => setLocation("/products")}
                >
                  Browse Products
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-white text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-8 py-3 text-lg"
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Get Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search for pneumatic tools, valves, pressure gauges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="h-12"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="md:w-64 h-12">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => cat.value !== "")
                  .map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
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
      </div>
    </section>
  );
}
