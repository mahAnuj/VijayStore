export default function AboutSection() {
  const stats = [
    { title: "Annual Turnover", value: "₹1.5 - 5 Cr" },
    { title: "Team Size", value: "Up to 10 People" },
    { title: "Business Type", value: "Wholesale Trader" },
    { title: "Experience", value: "11+ Years" },
  ];

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Vijay Traders</h2>
            <p className="text-lg text-gray-600 mb-6">
              Established in 2014, Vijay Traders is well recognized as a Wholesale Trader of Air Blow Gun, Pneumatic Foot Pedal, Pneumatic Air Cylinder, Danfoss Pressure Switches, Stainless Steel Manifold Valves, Pneumatic Pressure Gauge, and more.
            </p>
            <p className="text-gray-600 mb-8">
              Based in Delhi Gate, Ghaziabad, Uttar Pradesh, we have built a reputation for providing high-quality industrial equipment to businesses across India. Our partnership firm is led by experienced professionals including Udit Mahajan, Kamal Kant Mahajan, and Vijay Kumar.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{stat.title}</h4>
                  <p className="text-blue-600 font-bold text-xl">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Industrial warehouse facility"
              className="rounded-xl shadow-lg w-full h-64 object-cover"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Professional office building"
                className="rounded-lg shadow-md w-full h-32 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1553163147-622ab57be1c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                alt="Organized warehouse storage"
                className="rounded-lg shadow-md w-full h-32 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
