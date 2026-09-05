export interface SubcategoryItem {
  id: string;
  title: string;
  banner: string;
  items: string[];
}

export interface CategoryTaxonomy {
  slug: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultBanner?: string;
  subcategories: SubcategoryItem[];
}

export const CATEGORY_TAXONOMIES: Record<string, CategoryTaxonomy> = {
  "graphics-and-design": {
    slug: "graphics-and-design",
    name: "Graphics & Design",
    heroTitle: "Graphics Design",
    heroSubtitle: "Logo design, UI/UX, brand identity & vector art by elite designers",
    defaultBanner: "/images/category-hub/hero-banner-exact.png",
    subcategories: [
      {
        id: "logo-brand-identity",
        title: "Logo & Brand Identity",
        banner: "/images/category-hub/card-1.png",
        items: [
          "Logo Design",
          "Brand Style Guide",
          "Business Card & Stationary",
          "Fonts & Typography",
          "Art Direction"
        ]
      },
      {
        id: "digital-marketing-design",
        title: "Digital Marketing",
        banner: "/images/category-hub/card-2.png",
        items: [
          "Social Media Campaigns",
          "Email Marketing Strategies",
          "SEO Optimization",
          "Content Creation",
          "Analytics & Reporting"
        ]
      },
      {
        id: "innovative-digital-strategies",
        title: "Innovative Digital Strategies",
        banner: "/images/category-hub/card-3.png",
        items: [
          "Engaging Social Media Initiatives",
          "Targeted Email Campaigns",
          "Advanced SEO Techniques",
          "Dynamic Content Development",
          "Comprehensive Analytics & Insights"
        ]
      },
      {
        id: "product-design",
        title: "Product Design",
        banner: "/images/category-hub/card-4.png",
        items: [
          "User Research",
          "Wireframing & Prototyping",
          "UI/UX Design",
          "User Testing",
          "Design Systems"
        ]
      },
      {
        id: "visual-identity-branding",
        title: "Visual Identity & Branding Solutions",
        banner: "/images/category-hub/card-5.png",
        items: [
          "Custom Logo Crafting",
          "Comprehensive Brand Guidelines",
          "Stationery & Business Card Design",
          "Typography & Font Selection",
          "Creative Direction"
        ]
      },
      {
        id: "online-promotion-strategies",
        title: "Online Promotion Strategies",
        banner: "/images/category-hub/card-6.png",
        items: [
          "Social Media Marketing Strategies",
          "Email Outreach Techniques",
          "Search Engine Enhancement",
          "Content Development",
          "Performance Analytics & Insights"
        ]
      },
      {
        id: "cutting-edge-digital",
        title: "Cutting-Edge Digital Approaches",
        banner: "/images/category-hub/card-7.png",
        items: [
          "Interactive Social Media Campaigns",
          "Personalized Email Marketing",
          "Expert SEO Strategies",
          "Adaptive Content Creation",
          "In-Depth Analytics & Reporting"
        ]
      },
      {
        id: "creative-product-development",
        title: "Creative Product Development",
        banner: "/images/category-hub/card-8.png",
        items: [
          "User Experience Research",
          "Prototyping & Wireframing",
          "User Interface & Experience Design",
          "Usability Testing",
          "Design Frameworks"
        ]
      }
    ]
  },

  "ai-services": {
    slug: "ai-services",
    name: "AI Services",
    heroTitle: "AI Services",
    heroSubtitle: "Machine learning, prompt engineering, ChatGPT & AI tools",
    defaultBanner: "https://res.cloudinary.com/cqtrqtyu/image/upload/v1786878929/category_banners/q1smrnetz2cunekh2kql.jpg",
    subcategories: [
      {
        id: "ai-applications-chatbots",
        title: "AI Applications & Chatbots",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "ChatGPT & AI Assistant Development",
          "Custom AI Chatbots",
          "LangChain & LlamaIndex Integrations",
          "Multi-Agent AI Workflows",
          "Website AI Integration"
        ]
      },
      {
        id: "generative-ai-llms",
        title: "Generative AI & LLMs",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Fine-Tuning Large Language Models",
          "Prompt Engineering & Optimization",
          "Custom GPTs & RAG Knowledge",
          "AI Content Pipelines",
          "Vector Databases & Embeddings"
        ]
      },
      {
        id: "ai-art-creative-media",
        title: "AI Art & Creative Media",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Midjourney & Stable Diffusion Art",
          "AI Video Generation & Animation",
          "AI Voice Cloning & Synthesis",
          "Image Inpainting & Upscaling",
          "AI Avatars & Digital Humans"
        ]
      },
      {
        id: "machine-learning-data-science",
        title: "Machine Learning & Data Science",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "Predictive Modeling & Analytics",
          "Supervised & Unsupervised Learning",
          "Computer Vision & Detection",
          "NLP & Sentiment Analysis",
          "Recommendation Engines"
        ]
      },
      {
        id: "ai-automation-workflows",
        title: "AI Automation & Workflows",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "Make.com & Zapier AI Automation",
          "Automated AI Web Scraping",
          "AI Email & Lead Automation",
          "Autonomous AI Agents",
          "Workflow Optimization"
        ]
      },
      {
        id: "ai-tool-saas-integration",
        title: "AI Tool & SaaS Integration",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "OpenAI & Claude API Integration",
          "Hugging Face Model Deployment",
          "Speech-to-Text & Whisper AI",
          "AI Coding Assistant Setup",
          "Cloud AI Infrastructure"
        ]
      },
      {
        id: "ai-business-consulting",
        title: "AI Business Consulting",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Enterprise AI Strategy & Roadmaps",
          "AI Implementation Feasibility",
          "Tech Stack & Model Selection",
          "AI Ethics, Security & Compliance",
          "ROI & Efficiency Assessment"
        ]
      },
      {
        id: "data-prep-model-tuning",
        title: "Data Preparation & Model Tuning",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Dataset Annotation & Labeling",
          "Model Evaluation & Testing",
          "Synthetic Data Generation",
          "LoRA Model Training",
          "Edge AI Deployment"
        ]
      }
    ]
  },

  "programming-and-tech": {
    slug: "programming-and-tech",
    name: "Programming & Tech",
    heroTitle: "Programming & Tech",
    heroSubtitle: "Web development, mobile apps, software & DevOps",
    defaultBanner: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "web-development",
        title: "Web Development",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Full-Stack Web Applications",
          "Next.js & React Development",
          "Vue.js & Angular Apps",
          "E-Commerce Web Development",
          "Landing Page Building"
        ]
      },
      {
        id: "mobile-app-development",
        title: "Mobile App Development",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "React Native Apps",
          "Flutter iOS & Android Apps",
          "Native iOS Swift Development",
          "Native Android Kotlin Development",
          "App Store Submission & QA"
        ]
      },
      {
        id: "software-development-apis",
        title: "Software & API Development",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "RESTful & GraphQL APIs",
          "Microservices Architecture",
          "Python & Node.js Backends",
          "Database Design & SQL/NoSQL",
          "Payment Gateway Integration"
        ]
      },
      {
        id: "devops-cloud",
        title: "DevOps & Cloud Computing",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "AWS, Azure & GCP Setup",
          "Docker & Kubernetes Deployment",
          "CI/CD Pipeline Automation",
          "Server Migration & Maintenance",
          "SSL & Cloud Security"
        ]
      },
      {
        id: "cybersecurity-data-protection",
        title: "Cybersecurity & Protection",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Vulnerability Assessment",
          "Penetration Testing",
          "Malware Removal & Cleanup",
          "Security Hardening",
          "Compliance & Audits"
        ]
      },
      {
        id: "qa-code-review",
        title: "QA & Code Review",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "Automated Testing (Playwright/Jest)",
          "Manual QA Testing",
          "Performance Optimization",
          "Code Refactoring & Clean Code",
          "Bug Fixes & Troubleshooting"
        ]
      },
      {
        id: "blockchain-web3",
        title: "Blockchain & Web3",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "Smart Contract Development",
          "DApp Development",
          "Solidity & EVM Contracts",
          "Crypto Wallet Integration",
          "NFT Minting Platforms"
        ]
      },
      {
        id: "scripts-automation",
        title: "Scripts & Automation",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Python Automation Scripts",
          "Web Scraping & Bots",
          "Excel & Google Sheets Automation",
          "Task Schedulers & Cron Jobs",
          "API Connectors"
        ]
      }
    ]
  },

  "digital-marketing": {
    slug: "digital-marketing",
    name: "Digital Marketing",
    heroTitle: "Digital Marketing",
    heroSubtitle: "SEO, Google Ads, social media & growth marketing",
    defaultBanner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "search-engine-optimization",
        title: "Search Engine Optimization (SEO)",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "On-Page SEO Optimization",
          "Technical SEO & Core Web Vitals",
          "Keyword Research & Strategy",
          "Backlink Building & Outreach",
          "Local SEO & Google Business"
        ]
      },
      {
        id: "social-media-marketing",
        title: "Social Media Marketing",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "Instagram & TikTok Growth",
          "LinkedIn B2B Lead Gen",
          "Social Media Content Strategy",
          "Community Management",
          "Influencer Marketing Outreach"
        ]
      },
      {
        id: "paid-advertising-sem",
        title: "Paid Advertising & SEM",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Google Search & Display Ads",
          "Meta (Facebook & Instagram) Ads",
          "TikTok & YouTube Video Ads",
          "Retargeting & Pixel Setup",
          "Ad Copywriting & Creative Testing"
        ]
      },
      {
        id: "email-marketing-automation",
        title: "Email Marketing & Automation",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "Klaviyo & Mailchimp Setup",
          "Email Drip Campaigns & Flows",
          "Newsletter Design & Copywriting",
          "List Segmentation & Deliverability",
          "A/B Testing & Conversions"
        ]
      },
      {
        id: "content-marketing-strategy",
        title: "Content Marketing & Strategy",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "Content Strategy & Calendars",
          "Blog Writing & SEO Articles",
          "Copywriting for Landing Pages",
          "Brand Storytelling",
          "PR & Media Distribution"
        ]
      },
      {
        id: "conversion-rate-optimization",
        title: "Conversion Rate Optimization (CRO)",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "Landing Page Audits",
          "Heatmap & User Session Analysis",
          "Funnel Optimization",
          "Checkout & Cart Drop-off Fixes",
          "A/B Testing Experiments"
        ]
      },
      {
        id: "analytics-tracking",
        title: "Web Analytics & Tracking",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Google Analytics 4 (GA4) Setup",
          "Google Tag Manager (GTM)",
          "Conversion Tracking & Attribution",
          "Custom Looker Studio Dashboards",
          "E-Commerce Tracking"
        ]
      },
      {
        id: "growth-hacking-strategy",
        title: "Growth Marketing & Strategy",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Viral & Referral Loops",
          "Product-Led Growth Tactics",
          "Competitor Market Analysis",
          "Go-to-Market Strategy",
          "Affiliate Program Setup"
        ]
      }
    ]
  },

  "video-and-animation": {
    slug: "video-and-animation",
    name: "Video & Animation",
    heroTitle: "Video & Animation",
    heroSubtitle: "Video editing, 3D animation, motion graphics & intros",
    defaultBanner: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "video-editing",
        title: "Video Editing",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "YouTube Video Editing",
          "TikTok & Instagram Reels Editing",
          "Corporate & Promo Video Editing",
          "Color Grading & Audio Syncing",
          "Podcast Video Editing"
        ]
      },
      {
        id: "motion-graphics",
        title: "Motion Graphics & Intros",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "Logo Animation & Reveals",
          "Title Sequences & Lower Thirds",
          "Animated Infographics",
          "Stream Overlays & Screens",
          "Kinetic Typography"
        ]
      },
      {
        id: "3d-animation-cgi",
        title: "3D Animation & CGI",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "3D Product Animation",
          "3D Character Animation",
          "Visual Effects (VFX)",
          "Architectural Walkthroughs",
          "3D Medical & Technical Animation"
        ]
      },
      {
        id: "explainer-videos",
        title: "Explainer Videos",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "2D Animated Explainers",
          "Whiteboard Animation",
          "SaaS Product Walkthroughs",
          "Educational & Training Videos",
          "App Demo Videos"
        ]
      },
      {
        id: "social-video-ads",
        title: "Short Video Ads",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "UGC Style Video Ads",
          "E-Commerce Product Ads",
          "TikTok & Snap Ad Creatives",
          "Video Sales Letters (VSL)",
          "High-Converting Ad Hooks"
        ]
      },
      {
        id: "subtitles-captions",
        title: "Subtitles & Captions",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "Viral Captions (Alex Hormozi Style)",
          "SRT & VTT Subtitle Creation",
          "Multi-Language Subtitling",
          "Closed Captioning (CC)",
          "Dynamic Text Animations"
        ]
      },
      {
        id: "music-videos-lyric",
        title: "Music Videos & Lyric Videos",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Animated Lyric Videos",
          "Visualizer Creation",
          "Music Video Post-Production",
          "Audio-Reactive Visuals",
          "Teasers & Promos"
        ]
      },
      {
        id: "visual-effects-cleanup",
        title: "VFX & Screen Clean-up",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Green Screen Removal / Keying",
          "Rotoscoping & Masking",
          "Object Removal & Wire Cleanup",
          "CGI Compositing",
          "Sky Replacement & Matte Painting"
        ]
      }
    ]
  },

  "writing-and-translation": {
    slug: "writing-and-translation",
    name: "Writing & Translation",
    heroTitle: "Writing & Translation",
    heroSubtitle: "Copywriting, blog posts, resumes & translation",
    defaultBanner: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "copywriting",
        title: "High-Converting Copywriting",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Landing Page & Website Copy",
          "Sales Emails & Sequences",
          "Ad Copy (Google, Meta, TikTok)",
          "Brand Taglines & Slogans",
          "Product Descriptions"
        ]
      },
      {
        id: "content-writing",
        title: "Articles & Blog Posts",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "SEO Optimized Articles",
          "Thought Leadership & Ghostwriting",
          "Listicles & Guides",
          "Industry News & Analysis",
          "Case Studies & Success Stories"
        ]
      },
      {
        id: "translation-localization",
        title: "Translation & Localization",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Document Translation",
          "Website & App Localization",
          "Legal & Medical Translation",
          "Subtitles & Voiceover Scripts",
          "Proofreading & Native Polish"
        ]
      },
      {
        id: "career-writing",
        title: "Resume & Career Writing",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "ATS-Optimized Resumes & CVs",
          "LinkedIn Profile Makeovers",
          "Cover Letters",
          "Executive Bios",
          "Interview Prep Scripts"
        ]
      },
      {
        id: "business-writing",
        title: "Business & Grant Writing",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "Business Plans & Proposals",
          "Whitepapers & Reports",
          "Grant Proposals & Applications",
          "Pitch Decks & Investor Notes",
          "Company Handbooks & SOPs"
        ]
      },
      {
        id: "technical-writing",
        title: "Technical Writing",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "API Documentation & SDK Guides",
          "User Manuals & Help Guides",
          "Software Specifications",
          "Research Papers & Summaries",
          "Technical Whitepapers"
        ]
      },
      {
        id: "creative-writing",
        title: "Creative & Script Writing",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "YouTube & Video Scripts",
          "Podcast Scripts",
          "E-Books & Ghostwriting",
          "Creative Storytelling",
          "Songwriting & Poetry"
        ]
      },
      {
        id: "editing-proofreading",
        title: "Proofreading & Editing",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Grammar & Syntax Correction",
          "Line Editing & Flow",
          "Manuscript & Book Editing",
          "Academic Paper Editing",
          "Tone & Style Consistency"
        ]
      }
    ]
  },

  "e-commerce": {
    slug: "e-commerce",
    name: "E-Commerce",
    heroTitle: "E-Commerce",
    heroSubtitle: "Shopify, Amazon, product listings, store management",
    defaultBanner: "https://res.cloudinary.com/cqtrqtyu/image/upload/v1786871700/category_banners/hjuzbbhbxy1do3t0vsee.png",
    subcategories: [
      {
        id: "shopify-store-development",
        title: "Shopify Store Development",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Custom Shopify Store Setup",
          "Shopify Theme Customization",
          "Shopify App Integration",
          "Dropshipping Store Automation",
          "Speed & Mobile Optimization"
        ]
      },
      {
        id: "amazon-seller-services",
        title: "Amazon Seller & FBA",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "Amazon Product Listing Optimization",
          "Amazon A+ Enhanced Content",
          "Amazon PPC Campaign Management",
          "Storefront Design",
          "Product Hunting & Research"
        ]
      },
      {
        id: "e-commerce-seo",
        title: "E-Commerce SEO & Listings",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Product Title & Keyword SEO",
          "Category Page Optimization",
          "Rich Snippets & Schema Markup",
          "Competitor Price Analysis",
          "Bulk Product Uploads"
        ]
      },
      {
        id: "etsy-ebay-walmart",
        title: "Multi-Channel Marketplace",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "Etsy Shop Setup & SEO",
          "eBay Store Management",
          "Walmart Marketplace Launch",
          "TikTok Shop Integration",
          "Inventory Sync Across Platforms"
        ]
      },
      {
        id: "product-photography-mockups",
        title: "Product Imagery & Mockups",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "3D Product Mockups",
          "E-Commerce Background Removal",
          "Infographic Feature Images",
          "Lifestyle Product Staging",
          "Packaging & Label Design"
        ]
      },
      {
        id: "woocommerce-custom-stores",
        title: "WooCommerce & Custom Stores",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "WooCommerce WordPress Setup",
          "Payment Gateway Configuration",
          "Custom Checkout Flows",
          "Subscription & Membership Models",
          "B2B Wholesale Portals"
        ]
      },
      {
        id: "e-commerce-marketing-ads",
        title: "E-Commerce Marketing & Ads",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Facebook & Instagram Catalog Ads",
          "Google Shopping Ads (PMax)",
          "TikTok Shopping Creatives",
          "Klaviyo Abandoned Cart Flows",
          "Upsell & Cross-Sell Strategy"
        ]
      },
      {
        id: "store-management-va",
        title: "Virtual Assistant & Operations",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Order Fulfillment & Tracking",
          "Customer Service & Live Chat",
          "Inventory Management",
          "Returns & Refund Processing",
          "Supplier Communication"
        ]
      }
    ]
  },

  "business-and-consulting": {
    slug: "business-and-consulting",
    name: "Business & Consulting",
    heroTitle: "Business & Consulting",
    heroSubtitle: "Business plans, virtual assistant, finance & legal",
    defaultBanner: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "business-plans-strategy",
        title: "Business Plans & Strategy",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Investor-Ready Business Plans",
          "Market & Competitive Analysis",
          "Financial Modeling & Forecasting",
          "Pitch Deck Structuring",
          "Strategic Growth Roadmaps"
        ]
      },
      {
        id: "virtual-assistant-ops",
        title: "Virtual Assistant Services",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "Executive Administrative Support",
          "Email & Calendar Management",
          "Data Entry & Spreadsheets",
          "Customer Support Support",
          "Travel Planning & Logistics"
        ]
      },
      {
        id: "financial-consulting",
        title: "Financial & Accounting Consulting",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "QuickBooks & Xero Bookkeeping",
          "Financial Statement Preparation",
          "Cash Flow & Budget Analysis",
          "Tax Preparation & Advice",
          "Valuation & Due Diligence"
        ]
      },
      {
        id: "legal-consulting-contracts",
        title: "Legal Consulting & Contracts",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "NDAs & Non-Compete Agreements",
          "Terms of Service & Privacy Policies",
          "Employment & Contractor Agreements",
          "Trademark & IP Guidance",
          "GDPR & Compliance Audits"
        ]
      },
      {
        id: "hr-talent-acquisition",
        title: "Human Resources & Recruiting",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "Job Description Formulation",
          "Candidate Sourcing & Screening",
          "Employee Onboarding Frameworks",
          "Compensation & Benefits Design",
          "HR Policy Documentation"
        ]
      },
      {
        id: "project-management",
        title: "Project Management",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "Agile / Scrum Sprint Management",
          "Jira, Asana & Trello Setup",
          "Milestone & Timeline Tracking",
          "Risk Assessment & Mitigation",
          "Stakeholder Reporting"
        ]
      },
      {
        id: "sales-lead-generation",
        title: "Sales & B2B Lead Generation",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Targeted B2B Lead Lists",
          "Cold Email Outreach Setup",
          "LinkedIn Sales Navigator Prospecting",
          "CRM Setup (HubSpot / Salesforce)",
          "Sales Script Writing"
        ]
      },
      {
        id: "sustainability-consulting",
        title: "Operations & Business Optimization",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Standard Operating Procedures (SOPs)",
          "Supply Chain & Vendor Management",
          "Cost Reduction Analysis",
          "Process Automation",
          "Change Management"
        ]
      }
    ]
  },

  "data-and-analytics": {
    slug: "data-and-analytics",
    name: "Data & Analytics",
    heroTitle: "Data & Analytics",
    heroSubtitle: "Data analysis, visualization, Excel & data science",
    defaultBanner: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "data-visualization-dashboards",
        title: "Data Visualization & Dashboards",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Power BI Interactive Dashboards",
          "Tableau Visualizations",
          "Google Looker Studio Reports",
          "KPI Scorecards & Trackers",
          "Executive Summary Dashboards"
        ]
      },
      {
        id: "excel-google-sheets",
        title: "Excel & Google Sheets",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "Advanced Formulas & VBA Macros",
          "Google Apps Script Automation",
          "Automated Financial Spreadsheets",
          "Pivot Tables & Data Modeling",
          "Error Fixing & Optimization"
        ]
      },
      {
        id: "data-analytics-insights",
        title: "Data Analytics & Insights",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Exploratory Data Analysis (EDA)",
          "Customer Churn & Retention Analysis",
          "Sales Trend Forecasting",
          "Statistical Modeling (R / Python)",
          "A/B Testing Statistical Evaluation"
        ]
      },
      {
        id: "database-sql-engineering",
        title: "Database Design & SQL",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "Complex SQL Queries & Joins",
          "PostgreSQL & MySQL Database Design",
          "Database Performance Tuning",
          "Stored Procedures & Triggers",
          "Database Migration & Cleanup"
        ]
      },
      {
        id: "data-cleaning-prep",
        title: "Data Cleaning & Preparation",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "Handling Missing Data & Outliers",
          "Data Normalization & Formatting",
          "Duplicate Removal & Deduplication",
          "ETL Pipeline Construction",
          "Automated Data Validation"
        ]
      },
      {
        id: "machine-learning-predictive",
        title: "Predictive Analytics & ML",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "Regression & Classification Models",
          "Time Series Forecasting",
          "Clustering & Customer Segmentation",
          "Anomaly Detection Systems",
          "Model Scoring & Interpretation"
        ]
      },
      {
        id: "web-scraping-extraction",
        title: "Data Scraping & Extraction",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Python Scrapy & BeautifulSoup Bots",
          "Selenium & Puppeteer Automation",
          "API Data Harvesting",
          "Lead & Product Catalog Scraping",
          "Scheduled Web Crawlers"
        ]
      },
      {
        id: "big-data-cloud",
        title: "Cloud Data Engineering",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Google BigQuery & Snowflake Setup",
          "AWS Redshift Data Warehousing",
          "Apache Spark & Airflow Pipelines",
          "Data Lake Architecture",
          "Real-Time Stream Processing"
        ]
      }
    ]
  },

  "music-and-audio": {
    slug: "music-and-audio",
    name: "Music & Audio",
    heroTitle: "Music & Audio",
    heroSubtitle: "Voiceover, audio editing, mixing & music production",
    defaultBanner: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "voice-over-narration",
        title: "Voice Over & Narration",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Commercial & Ad Voiceovers",
          "Audiobook Narration (ACX)",
          "Animation & Character Voices",
          "E-Learning & Explainer Voiceovers",
          "IVR & Phone System Greetings"
        ]
      },
      {
        id: "mixing-mastering",
        title: "Mixing & Mastering",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "Stem Mixing for Songs",
          "Radio-Ready Audio Mastering",
          "Vocal Tuning & Pitch Correction",
          "Analog & Digital Mastering",
          "Dolby Atmos & Spatial Audio"
        ]
      },
      {
        id: "audio-editing-cleaning",
        title: "Audio Editing & Podcast Production",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Podcast Audio Cleanup & Editing",
          "Background Noise & Hiss Removal",
          "De-Essing & Breath Removal",
          "Audio Level Normalization",
          "Intro/Outro Music Integration"
        ]
      },
      {
        id: "music-production-beats",
        title: "Music Production & Beats",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "Custom Beat Production (Hip Hop, Pop, EDM)",
          "Original Song Arrangements",
          "Ghost Production",
          "Remixing & Sample Flipping",
          "Instrumental Backing Tracks"
        ]
      },
      {
        id: "jingles-intros",
        title: "Jingles, Intros & Sonic Branding",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "Brand Audio Logos & Earcons",
          "Podcast Intro & Outro Music",
          "Radio & TV Commercial Jingles",
          "YouTube Channel Audio Branding",
          "Custom Sound Bites"
        ]
      },
      {
        id: "sound-design-foley",
        title: "Sound Design & Game Audio",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "Video Game SFX & UI Sounds",
          "Film & Animation Foley",
          "Sci-Fi & Synth Sound Effects",
          "Atmospheres & Ambience Tracks",
          "Audio Implementation (Wwise / FMOD)"
        ]
      },
      {
        id: "songwriting-composition",
        title: "Songwriting & Composition",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Topline Melody Writing",
          "Lyrics Writing & Storytelling",
          "Orchestral & Cinematic Scores",
          "Piano & Guitar Composition",
          "Commercial Film Scoring"
        ]
      },
      {
        id: "session-musicians-singers",
        title: "Session Musicians & Vocalists",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Lead & Harmony Vocals",
          "Electric & Acoustic Guitar Tracks",
          "Live Bass & Keyboard Recording",
          "Live Drums & Percussion Stems",
          "Brass & String Sections"
        ]
      }
    ]
  },

  "other-and-general": {
    slug: "other-and-general",
    name: "Other & General",
    heroTitle: "Other & General",
    heroSubtitle: "Lifestyle, gaming, coaching & custom tasks, others",
    defaultBanner: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    subcategories: [
      {
        id: "gaming-coaching",
        title: "Gaming & Esports Coaching",
        banner: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80",
        items: [
          "Competitive Gameplay Coaching",
          "VOD Review & Analysis",
          "Rank Boost & Skill Training",
          "Esports Team Strategy",
          "Gaming Highlights Creation"
        ]
      },
      {
        id: "life-coaching-wellness",
        title: "Life Coaching & Wellness",
        banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        items: [
          "Personal Productivity Coaching",
          "Mindfulness & Habit Building",
          "Fitness & Workout Plans",
          "Nutrition & Meal Guides",
          "Career Transition Mentorship"
        ]
      },
      {
        id: "crafts-diy",
        title: "Arts, Crafts & DIY",
        banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        items: [
          "Custom Handmade Gifts",
          "DIY Project Blueprints & Plans",
          "Sewing & Pattern Making",
          "Woodworking Schematics",
          "Origami & Paper Art"
        ]
      },
      {
        id: "event-planning",
        title: "Event Planning & Invites",
        banner: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        items: [
          "Wedding Planning Checklists",
          "Party Invitation Design",
          "Corporate Event Agendas",
          "Virtual Event Production",
          "Budget & Vendor Tracking"
        ]
      },
      {
        id: "travel-advisory",
        title: "Travel & Itinerary Planning",
        banner: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
        items: [
          "Custom Vacation Itineraries",
          "Budget Travel Optimization",
          "Local Hidden Gem Guides",
          "Flight & Hotel Recommendations",
          "Visa Application Assistance"
        ]
      },
      {
        id: "online-tutoring",
        title: "Online Tutoring & Lessons",
        banner: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        items: [
          "Language Conversation Practice",
          "Math & Science Tutoring",
          "Music Instrument Lessons",
          "Coding & Computer Lessons",
          "Exam & Test Preparation"
        ]
      },
      {
        id: "astrology-personal",
        title: "Astrology & Personal Readings",
        banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        items: [
          "Birth Chart Analysis",
          "Tarot Card Readings",
          "Horoscope Forecasts",
          "Numerology Calculations",
          "Personal Guidance Sessions"
        ]
      },
      {
        id: "custom-tasks-requests",
        title: "Custom Special Tasks",
        banner: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&w=600&q=80",
        items: [
          "Custom Research Projects",
          "Mystery Shopping Reports",
          "Bespoke Digital Requests",
          "User Testing & Feedback",
          "Miscellaneous Virtual Assistance"
        ]
      }
    ]
  }
};

/**
 * Adapter helper to merge live API category data with our taxonomy fallback.
 */
export const getCategoryTaxonomy = (slug: string, apiCategories?: any[]): CategoryTaxonomy | null => {
  if (!slug) return null;

  const normalizedSlug = slug.toLowerCase().trim();

  // Find exact or approximate match in CATEGORY_TAXONOMIES
  let matchedTaxonomy = CATEGORY_TAXONOMIES[normalizedSlug];

  if (!matchedTaxonomy) {
    const foundKey = Object.keys(CATEGORY_TAXONOMIES).find(
      key => key === normalizedSlug || key.includes(normalizedSlug) || normalizedSlug.includes(key)
    );
    if (foundKey) {
      matchedTaxonomy = CATEGORY_TAXONOMIES[foundKey];
    }
  }

  // Look for matching live API category
  const apiCategory = apiCategories?.find((cat: any) => {
    const catSlug = (cat?.slug || cat?.name || '').toLowerCase().trim();
    return catSlug === normalizedSlug || cat?.id === slug || cat?._id === slug;
  });

  if (!matchedTaxonomy) {
    const fallbackTitle = apiCategory?.name || slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    return {
      slug: normalizedSlug,
      name: fallbackTitle,
      heroTitle: fallbackTitle,
      heroSubtitle: apiCategory?.description || `Discover top quality ${fallbackTitle} services from verified experts`,
      defaultBanner: apiCategory?.banner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      subcategories: []
    };
  }

  // Merge live API category fields (name, description, banner) over static taxonomy
  return {
    ...matchedTaxonomy,
    name: apiCategory?.name || matchedTaxonomy.name,
    heroTitle: apiCategory?.name || matchedTaxonomy.heroTitle,
    heroSubtitle: apiCategory?.description || matchedTaxonomy.heroSubtitle,
    defaultBanner: apiCategory?.banner || matchedTaxonomy.defaultBanner,
    // If live API ever provides dynamic subcategories, prefer them!
    subcategories: (apiCategory?.subcategories && Array.isArray(apiCategory.subcategories) && apiCategory.subcategories.length > 0)
      ? apiCategory.subcategories
      : matchedTaxonomy.subcategories
  };
};
