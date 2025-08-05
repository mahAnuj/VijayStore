import { Tag, Calendar, Users, Star } from "lucide-react";

export default function TrustIndicators() {
  const indicators = [
    {
      icon: Tag,
      title: "GST Verified",
      description: "09AALFV1464C1Z4",
      color: "text-green-600 bg-green-100",
    },
    {
      icon: Calendar,
      title: "11+ Years",
      description: "In Business",
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: Users,
      title: "Partnership Firm",
      description: "Legal Status",
      color: "text-orange-600 bg-orange-100",
    },
    {
      icon: Star,
      title: "4.0 IndiaMART Rating",
      description: "Customer Reviews",
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {indicators.map((indicator, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 ${indicator.color}`}>
                <indicator.icon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900">{indicator.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{indicator.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
