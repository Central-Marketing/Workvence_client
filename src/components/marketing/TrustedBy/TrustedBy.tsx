import React from 'react';
import { VscVerified } from "react-icons/vsc";
import { RiGlobalLine } from "react-icons/ri";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { AiOutlineDollarCircle } from "react-icons/ai";

const TrustedBy = () => {
  const trustFeatures = [
    {
      title: "Escrow Protected",
      description: "Your payment stays secure until you approve.",
      icon: <IoShieldCheckmarkOutline size={50} className="w-[50px] h-[50px]" />
    },
    {
      title: "Verified Sellers",
      description: "Every professional reviewed for quality.",
      icon: <VscVerified size={50} className="w-[50px] h-[50px]" />
    },
    {
      title: "Global Marketplace",
      description: "Work with top experts from 90+ countries.",
      icon: <RiGlobalLine size={50} className="w-[50px] h-[50px]" />
    },
    {
      title: "Secure Payments",
      description: "Reliable, safe international payouts.",
      icon: <AiOutlineDollarCircle size={50} className="w-[50px] h-[50px]" />
    }
  ];

  return (
    <section className="w-full bg-[#fafafa] pb-8 pt-10 sm:pb-12 sm:pt-16 md:pb-14 md:pt-20 lg:pt-24">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="w-full bg-white rounded-2xl border-r border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center px-4 py-8 sm:py-9 lg:py-14">
                <div className="w-[50px] h-[50px] flex items-center justify-center mb-4 text-[#1E293B]">
                  {feature.icon}
                </div>
                <h3 className="font-sf-pro font-[500] mb-3 text-[24px] text-[#434343] leading-none mb-2 tracking-normal">
                  {feature.title}
                </h3>
                <p className="font-inter text-[20px] font-normal text-[#868686] leading-none">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
