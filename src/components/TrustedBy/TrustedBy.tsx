const TrustedBy = () => {
  const trustFeatures = [
    {
      title: "Escrow Protected",
      description: "Your payment stays secure until you approve.",
      icon: "/all-icons/shield-energy.svg"
    },
    {
      title: "Verified Sellers",
      description: "Every professional reviewed for quality.",
      icon: "/all-icons/id.svg"
    },
    {
      title: "Global Marketplace",
      description: "Work with top experts from 90+ countries.",
      icon: "/all-icons/global.svg"
    },
    {
      title: "Secure Payments",
      description: "Reliable, safe international payouts.",
      icon: "/all-icons/dollar-sign.svg"
    }
  ];

  return (
    <div className="w-full bg-gray-100 py-10 md:flex justify-center hidden">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center">
                <img src={feature.icon} alt={feature.title} className="w-6 h-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-bold text-gray-800">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-tight mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;
