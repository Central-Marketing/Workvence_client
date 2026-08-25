const TrustProtection = () => {
  const trustFeatures = [
    {
      title: "Escrow Protection",
      description: "Your funds are securely held in Workvence Vault until you authorize the release upon completion of milestones.",
      icon: "/all-icons/ai-security-03.svg"
    },
    {
      title: "Vetted Experts",
      description: "We manually verify every professional's identity, credentials, and work history to ensure only the top 1% join our community.",
      icon: "/all-icons/id.svg"
    },
    {
      title: "Dispute Resolution",
      description: "In the rare event of a disagreement, our neutral expert mediation team steps in to reach a fair and professional resolution.",
      icon: "/all-icons/scale.svg"
    }
  ];

  return (
    <section className="w-full bg-white py-10 md:py-20 flex justify-center">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-start md:items-center">
        <div className="text-left md:text-center max-w-3xl mb-12 w-full">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-4">
            Built Around Trust &amp; Protection
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed md:mx-auto">
            Every project is backed by secure escrow payments, manually vetted professionals, and transparent
            protection policies—so you can hire and collaborate with complete confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-8 md:p-9 flex flex-col items-start md:items-center text-left md:text-center transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                <img src={feature.icon} alt={feature.title} className="w-6 h-6 object-contain" />
              </div>
              <h3 className="text-[17px] font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed md:max-w-[280px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustProtection;
