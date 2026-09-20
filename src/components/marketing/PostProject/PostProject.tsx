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
                                width={1017}
                                height={750}
                                priority
                                className="w-full h-[380px] sm:h-[500px] md:h-[580px] lg:h-[750px] object-cover rounded-[20px] sm:rounded-[24px]"
                            />
                        </div>
                    </div>

                    {/* Right Column: Typography & Action */}
                    <div className="w-full flex flex-col justify-between self-stretch py-2 lg:py-4">
                        {/* Main Headline */}
                        <div>
                            <h2 className="font-sf-pro font-[510] not-italic text-[26px] min-[400px]:text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] macbook:text-[46px] 2xl:text-[48px] text-[var(--Foundation-Grey-grey-800,#292929)] leading-tight sm:leading-[1.18] tracking-tight sm:tracking-normal">
                                Describe What You Need.
                                <br />
                                Our AI Finds The Right Talent.
                            </h2>
                        </div>

                        {/* Description & CTA */}
                        <div className="mt-8 sm:mt-10 lg:mt-14 space-y-6 sm:space-y-7">
                            <p className="font-inter font-normal not-italic text-[16px] sm:text-[18px] lg:text-[20px] leading-[26px] sm:leading-[28px] lg:leading-[30px] text-[var(--Foundation-Grey-grey-400,#6E6E6E)] mt-2.5">
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
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M19.5 3.9375V5.5M19.5 5.5V7.0625M19.5 5.5H18.25M19.5 5.5H20.75M22 5.5L20.9156 5.13852C20.4179 4.97263 20.0274 4.58211 19.8615 4.08443L19.5 3L19.1385 4.08443C18.9726 4.58211 18.5821 4.97263 18.0844 5.13852L17 5.5L18.0844 5.86148C18.5821 6.02737 18.9726 6.41789 19.1385 6.91557L19.5 8L19.8615 6.91557C20.0274 6.41789 20.4179 6.02737 20.9156 5.86148L22 5.5Z" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2 12.8598C4.81875 10.0939 11.44 4.44198 13.275 6.40609C15.5938 8.888 3.40937 15.1646 5.28854 17.93C7.2734 20.851 14.2146 10.5543 16.5635 12.3982C18.9125 14.2422 10.926 18.391 12.8052 20.696C13.5569 21.6179 15.6239 20.235 16.5635 19.313" stroke="#292929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
