export interface DashboardPackageItem {
  id: string;
  title: string;
  coverImage: string;
  price: number;
  rating: number;
  reviewCount: number;
  badge?: string; // e.g. "Expert"
  seller: {
    id: string;
    username: string;
    avatar: string;
  };
}

export const MOCK_RECOMMENDED_PACKAGES: DashboardPackageItem[] = [
  {
    id: "rec-pkg-1",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-gigs/thumb-1.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    seller: {
      id: "seller-1",
      username: "Nick Jonas",
      avatar: "/images/mock-gigs/avatar-1.png",
    },
  },
  {
    id: "rec-pkg-2",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-gigs/thumb-2.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    seller: {
      id: "seller-2",
      username: "Nick Jonas",
      avatar: "/images/mock-gigs/avatar-2.png",
    },
  },
  {
    id: "rec-pkg-3",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-gigs/thumb-3.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    seller: {
      id: "seller-3",
      username: "Nick Jonas",
      avatar: "/images/mock-gigs/avatar-3.png",
    },
  },
  {
    id: "rec-pkg-4",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-gigs/thumb-4.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    seller: {
      id: "seller-4",
      username: "Nick Jonas",
      avatar: "/images/mock-gigs/avatar-4.png",
    },
  },
];

export const MOCK_POPULAR_PACKAGES: DashboardPackageItem[] = [
  {
    id: "pop-pkg-1",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-dashboard/pop-1.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    seller: {
      id: "seller-5",
      username: "Nick Jonas",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "pop-pkg-2",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-dashboard/pop-2.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    seller: {
      id: "seller-6",
      username: "Nick Jonas",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "pop-pkg-3",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-dashboard/pop-3.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    seller: {
      id: "seller-7",
      username: "Nick Jonas",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "pop-pkg-4",
    title: "I will design,redesign business wordpress website as divi expert",
    coverImage: "/images/mock-dashboard/pop-4.png",
    price: 150,
    rating: 4.9,
    reviewCount: 57,
    badge: "Expert",
    seller: {
      id: "seller-8",
      username: "Nick Jonas",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  },
];
