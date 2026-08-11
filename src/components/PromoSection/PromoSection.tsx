"use client";

const PromoSection = () => {

  return (
    <section className="w-full py-10 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-gray-500 leading-tight md:max-w-xl">
            Build Amazing Projects <br className="hidden md:block" />
            With Trusted Professionals
          </h2>
          <p className="text-gray-500 text-[16px] max-w-[400px] leading-relaxed">
            We bring ideas to life by connecting businesses with creative minds who build experiences that make an impact
          </p>
        </div>

        <div className="relative w-full aspect-video md:h-[650px] md:aspect-auto rounded-xl overflow-hidden group">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src="./media/video.mp4"
          />
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
