'use client';

import { useState } from 'react';
import './FAQ.scss';

const faqData = [
  {
    question: "How does escrow payment protection work?",
    answer: "Your payment is held securely while the seller completes the order. It is released after you review and approve the agreed delivery. This ensures both parties are protected throughout the transaction lifecycle."
  },
  {
    question: "How are sellers verified?",
    answer: "Every seller goes through a manual verification process where we check their identity, professional credentials, portfolio, and work history before they can offer services on the platform."
  },
  {
    question: "What happens if a seller does not deliver?",
    answer: "If a seller fails to deliver on time or the work doesn't meet the agreed requirements, you can open a dispute. Our mediation team will review the case and ensure a fair resolution, including a full refund if necessary."
  },
  {
    question: "Can I buy a fixed-price service and also post a project?",
    answer: "Absolutely! You can browse and purchase ready-made package packages for quick tasks, and also post custom projects to receive competitive bids from verified professionals."
  },
  {
    question: "How do sellers receive payments?",
    answer: "Once you approve the delivery, funds are released from escrow to the seller's Workvence wallet. Sellers can then withdraw to their preferred payment method, including bank transfer and PayPal."
  },
  {
    question: "Which currencies and payout methods are supported?",
    answer: "Workvence supports major currencies including USD, EUR, and GBP. Payout methods include bank transfers, PayPal, and other regional options depending on the seller's location."
  },
  {
    question: "Is Workvence available globally?",
    answer: "Yes! Workvence is available in over 90 countries. Both buyers and sellers from around the world can join and collaborate on projects across all categories."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-20">
      <div className="container mx-auto px-4 md:px-6 flex flex-col items-center">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

          {/* Left Column */}
          <div className="w-full lg:w-[520px] lg:flex-shrink-0 flex flex-col gap-10 lg:sticky lg:top-24">
            <div>
              <h2 className="text-[32px] lg:text-[40px] font-semibold text-gray-900 leading-tight tracking-tight mb-4">
                Frequently Asked Question
              </h2>
              <p className="text-[15px] text-gray-500 leading-relaxed">
                Find clear answers about payments, seller verification, project delivery, and everything you need to get started with confidence.
              </p>
            </div>

            <div className="bg-[#f9f9f9] rounded-2xl p-8 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-sm">
                <img src="/all-icons/customer-service-01.svg" alt="Support" className="w-6 h-6 object-contain" />
              </div>
              <h3 className="text-[20px] font-semibold text-gray-900 mb-3">Still Have Questions?</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
                Our specialized support team is ready to help you navigate the marketplace and answer technical queries.
              </p>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700 transition-colors"
              >
                Contact Support <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Right Column - Accordion */}
          <div className="flex-1 w-full flex flex-col gap-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className={`faq-item border border-gray-200 rounded-xl bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-sm ${openIndex === index ? 'faq-item--open border-gray-300 shadow-sm' : ''}`}
              >
                <div
                  className="flex items-center justify-between p-6 cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-[16px] font-semibold text-gray-900 leading-snug">
                    {item.question}
                  </span>
                  <button
                    className="flex-shrink-0 ml-4 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Toggle answer"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.2" />
                      {openIndex === index ? (
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <>
                          <path d="M12 8V16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 12H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                <div className="faq-item__answer">
                  <p className="px-6 pb-6 text-[14.5px] text-gray-500 leading-relaxed m-0 pt-0">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQ;
