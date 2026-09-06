// Layout components
export { default as Navbar } from "./layout/Navbar/Navbar";
export { default as CategoryBar } from "./layout/CategoryBar/CategoryBar";
export { default as Footer } from "./layout/Footer/Footer";
export { default as NotificationBell } from "./layout/NotificationBell/NotificationBell";
export { default as LayoutWrapper } from "./layout/LayoutWrapper/LayoutWrapper";
export { default as GlobalSocketListener } from "./layout/GlobalSocketListener/GlobalSocketListener";

// UI components
export { default as Loader } from "./ui/Loader/Loader";
export { default as CustomSelect } from "./ui/CustomSelect/CustomSelect";
export { default as ConfirmModal } from "./ui/ConfirmModal/ConfirmModal";
export { default as Slide } from "./ui/Slide/Slide";
export { default as PrevArrow } from "./ui/Arrows/PrevArrow";
export { default as NextArrow } from "./ui/Arrows/NextArrow";
export * from "./ui/Skeletons";

// Marketing components
export { default as Featured } from "./marketing/Featured/Featured";
export { default as TrustedBy } from "./marketing/TrustedBy/TrustedBy";
export { default as ExploreCategories } from "./marketing/ExploreCategories/ExploreCategories";
export { default as PopularServices } from "./marketing/PopularServices/PopularServices";
export { default as HowItWorks } from "./marketing/HowItWorks/HowItWorks";
export { default as PromoSection } from "./marketing/PromoSection/PromoSection";
export { default as TopRatedSellers } from "./marketing/TopRatedSellers/TopRatedSellers";
export { default as RecommendedSellers } from "./marketing/RecommendedSellers/RecommendedSellers";
export { default as TrustProtection } from "./marketing/TrustProtection/TrustProtection";
export { default as TwoWays } from "./marketing/TwoWays/TwoWays";
export { default as FAQ } from "./marketing/FAQ/FAQ";
export { default as CTA } from "./marketing/CTA/CTA";
export { default as PostProject } from "./marketing/PostProject/PostProject";
export { default as PrivacyPolicy } from "./marketing/PrivacyPolicy/PrivacyPolicy";
export { default as TermsAndConditions } from "./marketing/TermsAndConditions/TermsAndConditions";
export * from "./marketing/CategoryHub";
export * from "./marketing/SubcategoryView";

// Feature components (Re-exported from features for full backward compatibility)
export { default as HeaderInboxIcon } from "../features/chat/HeaderInboxIcon/HeaderInboxIcon";
export { default as CategoryCard } from "../features/gigs/CategoryCard/CategoryCard";
export { default as ProjectCard } from "../features/gigs/ProjectCard/ProjectCard";
export { default as PackageCard } from "../features/gigs/PackageCard/PackageCard";
export { CategoryIcon, default as CategoryIconDefault } from "../features/gigs/CategoryIcon/CategoryIcon";
export { default as Reviews } from "../features/gigs/Reviews/Reviews";
export { default as Review } from "../features/gigs/Review/Review";
export { default as CheckoutForm } from "../features/buyer/checkout/CheckoutForm/CheckoutForm";
export { default as FavoriteButton } from "../features/buyer/favorites/FavoriteButton/FavoriteButton";
export { default as FavoriteSellerButton } from "../features/buyer/favorites/FavoriteSellerButton/FavoriteSellerButton";
export { default as SubmitProposalModal } from "../features/buyer/briefs/SubmitProposalModal/SubmitProposalModal";
export { default as SellerPublicProfile } from "../features/profile/SellerPublicProfile/SellerPublicProfile";
export { default as SuspendedSeller } from "../features/seller/suspended/SuspendedSeller/SuspendedSeller";
export { default as OTPModal } from "../features/auth/OTPModal/OTPModal";
export { RevisionModal, ExtensionModal } from "../features/orders/OrderActionModals/OrderActionModals";
export { default as KycVerificationForm } from "../features/kyc/KycVerificationForm/KycVerificationForm";
export { default as KycPromptModal } from "../features/kyc/KycPromptModal/KycPromptModal";
export { default as KycRequiredModal } from "../features/kyc/KycRequiredModal/KycRequiredModal";
export * from "../features/seller/earnings/PayoutLogos/PayoutLogos";
