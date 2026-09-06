import React from 'react';
import Image from 'next/image';
import { AiGradientButton } from '@/components/ui';

const PostProject = () => {
    return (
        <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center w-full">

                    {/* Left Column: Image Mockup */}
                    <div className="w-full flex items-center justify-center">
                        <div className="w-full relative overflow-hidden rounded-[20px] sm:rounded-[24px]">
                            <Image
                                src="/media/postproject.png"
                                alt="Describe What You Need. Our AI Finds The Right Talent."
                                width={680}
                                height={460}
                                priority
                                className="w-full h-auto object-cover rounded-[20px] sm:rounded-[24px]"
                            />
                        </div>
                    </div>

                    {/* Right Column: Typography & Action */}
                    <div className="w-full flex flex-col justify-between self-stretch py-2 lg:py-4">
                        {/* Main Headline */}
                        <div>
                            <h2 className="font-sf-pro font-[510] text-[32px] sm:text-[38px] md:text-[48px] text-[#292929] leading-normal tracking-normal">
                                Describe What You Need.
                                <br />
                                Our AI Finds The Right Talent.
                            </h2>
                        </div>

                        {/* Description & CTA */}
                        <div className="mt-8 sm:mt-10 lg:mt-14 space-y-6 sm:space-y-7">
                            <p className="font-inter font-normal text-base sm:text-[15px] text-[#6E6E6E] mt-2.5">
                                Search the way you&apos;d actually explain it &ldquo;someone to redesign my
                                Shopify store&rdquo; or &ldquo;edit a 3-minute YouTube video.&rdquo; Our AI understands
                                what you mean, not just the words you type, and matches you to the
                                sellers who can deliver it. The more clearly you describe the job, the
                                better the results.
                            </p>

                            <div>
                                <AiGradientButton
                                    href="/briefs/create"
                                    className="w-[282px] h-[48px]"
                                    text="Post a Project with AI"
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
};

export default PostProject;
