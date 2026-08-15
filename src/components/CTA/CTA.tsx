import Link from 'next/link';

const CTA = () => {
  return (
    <section className="w-full bg-white py-16 md:py-24 flex justify-center">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-[#de5b31] rounded-3xl px-8 py-16 md:py-20 text-center relative overflow-hidden flex flex-col items-center">

          {/* Decorative Background Shapes */}
          <div className="absolute left-[10%] bottom-[20%] w-20 h-20 bg-[#e56d46] transform rotate-45 rounded-md hidden md:block"></div>
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#c74c25] transform rotate-45 translate-x-1/2 -translate-y-1/2 origin-top-right hidden md:block"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-6xl font-semibold text-white mb-6">
              Ready to Find Trusted<br className="hidden md:block" /> Expertise?
            </h2>
            <p className="text-white/90 text-[15px] leading-relaxed mb-10 max-w-[550px] mx-auto">
              Explore curated professional services or apply to join Workvence as a vetted
              seller. Scale your vision with the world's finest talent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/packages"
                className="w-full sm:w-auto bg-white text-gray-900 font-medium px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Find a service <span className="text-lg leading-none mb-0.5">&rarr;</span>
              </Link>
              <Link
                href="/register?seller=true"
                className="w-full sm:w-auto bg-[#0a0a0a] text-white font-medium px-7 py-3.5 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                Become a seller <span className="text-lg leading-none mb-0.5">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
