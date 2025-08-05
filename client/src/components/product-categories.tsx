import { Cog, Wind, Gauge, Wrench, Filter, Link as LinkIcon, ToggleLeft, User } from "lucide-react";
import { Link } from "wouter";

export default function ProductCategories() {
  const categories = [
    {
      name: "Solenoid Valves",
      icon: Cog,
      count: "3 Products",
      description: "Direct acting and brass solenoid operated valves",
      color: "from-blue-500 to-blue-600",
      slug: "solenoid-valves",
    },
    {
      name: "Air Blow Guns",
      icon: Wind,
      count: "2 Products",
      description: "Professional grade air blow guns for cleaning applications",
      color: "from-green-500 to-green-600",
      slug: "air-blow-guns",
    },
    {
      name: "Pressure Gauges",
      icon: Gauge,
      count: "2 Products",
      description: "Accurate pressure measurement instruments",
      color: "from-orange-500 to-orange-600",
      slug: "pressure-gauges",
    },
    {
      name: "Hydraulic Ball Valves",
      icon: Wrench,
      count: "2 Products",
      description: "Heavy-duty hydraulic valves and fittings",
      color: "from-purple-500 to-purple-600",
      slug: "hydraulic-ball-valves",
    },
    {
      name: "Air Filter Regulators",
      icon: Filter,
      count: "2 Products",
      description: "Pneumax and stainless steel air regulators",
      color: "from-gray-400 to-gray-500",
      slug: "air-filter-regulators",
    },
    {
      name: "Roto Seal Couplings",
      icon: LinkIcon,
      count: "2 Products",
      description: "Stainless steel and brass seal couplings",
      color: "from-indigo-400 to-indigo-500",
      slug: "roto-seal-couplings",
    },
    {
      name: "Pressure Switches",
      icon: ToggleLeft,
      count: "2 Products",
      description: "Danfoss KP 36 and digital pressure switches",
      color: "from-red-400 to-red-500",
      slug: "pressure-switches",
    },
    {
      name: "Pneumatic Foot Pedals",
      icon: User,
      count: "1 Product",
      description: "Janatics DP055F61 pneumatic foot pedal",
      color: "from-pink-400 to-pink-500",
      slug: "pneumatic-foot-pedals",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Categories</h2>
          <p className="text-lg text-gray-600">Browse our comprehensive range of industrial equipment by category</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isMainCategory = index < 4;
            
            return (
              <Link key={category.slug} href={`/products/${category.slug}`}>
                <div className={`${
                  isMainCategory 
                    ? `bg-gradient-to-br ${category.color} text-white` 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className={`text-3xl ${isMainCategory ? 'text-white' : 'text-gray-600'}`} />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isMainCategory 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {category.count}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:scale-105 transition-transform">
                    {category.name}
                  </h3>
                  <p className={`text-sm ${
                    isMainCategory ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
