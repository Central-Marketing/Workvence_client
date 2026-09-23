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
                        <div className="w-full relative overflow-hidden rounded-[6px]  aspect-[1017/750]">
                            <Image
                                src="/media/postproject.png"
                                alt="Describe What You Need. Our AI Finds The Right Talent."
                                width={1017}
                                height={750}
                                priority
                                quality={100}
                                unoptimized
                                sizes="(max-width: 1023px) 100vw, 50vw"
                                className="w-full h-full object-contain rounded-[6px] "
                            />
                        </div>
                    </div>

                    {/* Right Column: Typography & Action */}
                    <div className="w-full flex flex-col justify-center">
                        {/* Main Headline */}
                        <div>
                            <h2 className="font-sf-pro font-[510] not-italic text-[26px] min-[400px]:text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] macbook:text-[46px] 2xl:text-[48px] text-[var(--Foundation-Grey-grey-800,#292929)] leading-tight sm:leading-[1.18] tracking-tight sm:tracking-normal">
                                Describe What You Need.
                                <br />
                                Our AI Finds The Right Talent.
                            </h2>
                        </div>

                        {/* Description & CTA */}
                        <div className="mt-4 sm:mt-5 md:mt-6 space-y-6 sm:space-y-8">
                            <p className="font-inter font-normal not-italic text-[15px] sm:text-[16px] text-[var(--Foundation-Grey-grey-400,#6E6E6E)] leading-relaxed">
                                Search the way you&apos;d actually explain it &ldquo;someone to redesign my
                                Shopify store&rdquo; or &ldquo;edit a 3-minute YouTube video.&rdquo; Our AI understands
                                what you mean, not just the words you type, and matches you to the
                                sellers who can deliver it. The more clearly you describe the job, the
                                better the results.
                            </p>

                            <div>
                                <AiGradientButton
                                    href="/briefs/create"
                                    className=""
                                    text="Post a Project with AI"
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <path d="M0.75 7.60886C3.56875 4.84296 10.19 -0.808996 12.025 1.15511C14.3438 3.63702 2.15937 9.91366 4.03854 12.6791C6.0234 15.6001 12.9646 5.30336 15.3135 7.14726C17.6625 8.99126 9.676 13.1401 11.5552 15.4451C12.3069 16.367 14.3739 14.9841 15.3135 14.0621" stroke="#292929" strokeWidth="1.5" stroke-linecap="round" strokeLinejoin="round" />
                                        </svg>
                                    }
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
