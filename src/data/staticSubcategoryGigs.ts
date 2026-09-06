export interface StaticGigItem {
  _id: string;
  id: string;
  title: string;
  cover: string;
  price: number;
  star: number;
  starNumber: number;
  totalStars: number;
  sales: number;
  tags?: string[];
  user: {
    _id: string;
    username: string;
    image: string;
  };
}

export const STATIC_SUBCATEGORY_GIGS: StaticGigItem[] = [
  {
    _id: "mock-gig-1",
    id: "mock-gig-1",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-1.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Minimal Logo Design", "3D Logo"],
    user: {
      _id: "seller-1",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-1.png"
    }
  },
  {
    _id: "mock-gig-2",
    id: "mock-gig-2",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-2.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Hand Drawn", "Vintage"],
    user: {
      _id: "seller-2",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-2.png"
    }
  },
  {
    _id: "mock-gig-3",
    id: "mock-gig-3",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-3.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Geometric", "Cartoon"],
    user: {
      _id: "seller-3",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-3.png"
    }
  },
  {
    _id: "mock-gig-4",
    id: "mock-gig-4",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-4.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Lettering", "Signature", "Water Color"],
    user: {
      _id: "seller-4",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-4.png"
    }
  },
  {
    _id: "mock-gig-5",
    id: "mock-gig-5",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-1.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Minimal Logo Design", "3D Logo"],
    user: {
      _id: "seller-5",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-1.png"
    }
  },
  {
    _id: "mock-gig-6",
    id: "mock-gig-6",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-2.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Hand Drawn", "Vintage"],
    user: {
      _id: "seller-6",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-2.png"
    }
  },
  {
    _id: "mock-gig-7",
    id: "mock-gig-7",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-3.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Geometric", "Cartoon"],
    user: {
      _id: "seller-7",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-3.png"
    }
  },
  {
    _id: "mock-gig-8",
    id: "mock-gig-8",
    title: "I will design,redesign business wordpress website as divi expert",
    cover: "/images/mock-gigs/thumb-4.png",
    price: 150,
    star: 4.9,
    starNumber: 57,
    totalStars: 279.3,
    sales: 57,
    tags: ["Lettering", "Signature", "Water Color"],
    user: {
      _id: "seller-8",
      username: "Nick Jonas",
      image: "/images/mock-gigs/avatar-4.png"
    }
  }
];

export const getStaticSubcategoryGigs = (activeTag?: string) => {
  if (!activeTag) return STATIC_SUBCATEGORY_GIGS;
  const filtered = STATIC_SUBCATEGORY_GIGS.filter((gig) =>
    gig.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase())
  );
  return filtered.length > 0 ? filtered : STATIC_SUBCATEGORY_GIGS;
};
