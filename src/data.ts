import { CardItem, ProjectItem } from '@/types';

export interface DummyPackageItem {
  id: number | string;
  img: string;
  pp: string;
  desc: string;
  price: number;
  star: number;
  username: string;
}

export const cards: CardItem[] = [
  {
    id: 1,
    title: "AI Artists",
    desc: "Add talent to AI",
    img: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'ai',
  },
  {
    id: 2,
    title: "Logo Design",
    desc: "Build your brand",
    img: "https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'design',
  },
  {
    id: 3,
    title: "WordPress",
    desc: "Customize your site",
    img: "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'wordpress'
  },
  {
    id: 4,
    title: "Voice Over",
    desc: "Share your message",
    img: "https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'voice'
  },
  {
    id: 5,
    title: "Video Editing",
    desc: "Engage your audience",
    img: "https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'video'
  },
  {
    id: 6,
    title: "Social Media",
    desc: "Reach more customers",
    img: "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'social'
  },
  {
    id: 7,
    title: "SEO",
    desc: "Unlock growth online",
    img: "https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'seo'
  },
  {
    id: 8,
    title: "Illustration",
    desc: "Color your dreams",
    img: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'illustration'
  },
  {
    id: 9,
    title: "Translation",
    desc: "Go global",
    img: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'translation'
  },
  {
    id: 10,
    title: "Writing & Copy",
    desc: "Words that sell",
    img: "https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'writing'
  },
  {
    id: 11,
    title: "Data Entry",
    desc: "Accurate & fast",
    img: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=600",
    slug: 'data'
  },
];

export const projects: ProjectItem[] = [
  {
    id: 1,
    img: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "Web & Mobile Design",
    username: "Anna Bell",
  },
  {
    id: 2,
    img: "https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "SEO & Digital Marketing",
    username: "Morton Green",
  },
  {
    id: 3,
    img: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "Illustration & Art",
    username: "Emmett Potter",
  },
  {
    id: 4,
    img: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "Business Consulting",
    username: "Freddie Johnston",
  },
  {
    id: 5,
    img: "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "Social Media Strategy",
    username: "Audrey Richards",
  },
  {
    id: 6,
    img: "https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "Copywriting",
    username: "Dalton Hudson",
  },
  {
    id: 7,
    img: "https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "Voice Over & Audio",
    username: "Hannah Dougherty",
  },
  {
    id: 8,
    img: "https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1680175/pexels-photo-1680175.jpeg?auto=compress&cs=tinysrgb&w=400",
    cat: "Video Production",
    username: "Ward Brewer",
  },
];

export const packages: DummyPackageItem[] = [
  {
    id: 1,
    img: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will create stunning AI artwork from your photos and prompts",
    price: 59,
    star: 5,
    username: "Anna Bell",
  },
  {
    id: 2,
    img: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will design a modern, professional logo for your brand",
    price: 79,
    star: 5,
    username: "Lannie Coleman",
  },
  {
    id: 3,
    img: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1062280/pexels-photo-1062280.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will create unique digital illustrations and concept art",
    price: 112,
    star: 5,
    username: "Carol Steve",
  },
  {
    id: 4,
    img: "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will manage and grow your social media presence",
    price: 99,
    star: 4,
    username: "Don Weber",
  },
  {
    id: 5,
    img: "https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1771383/pexels-photo-1771383.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will record a professional voice over in any style",
    price: 59,
    star: 5,
    username: "Audrey Richards",
  },
  {
    id: 6,
    img: "https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/715546/pexels-photo-715546.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will edit and produce cinematic quality videos",
    price: 79,
    star: 4,
    username: "Walton Shepard",
  },
  {
    id: 7,
    img: "https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/720606/pexels-photo-720606.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will optimize your website for top Google rankings",
    price: 89,
    star: 5,
    username: "Waverly Schaefer",
  },
  {
    id: 8,
    img: "https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=800",
    pp: "https://images.pexels.com/photos/1699159/pexels-photo-1699159.jpeg?auto=compress&cs=tinysrgb&w=400",
    desc: "I will write compelling copy and content that converts",
    price: 110,
    star: 4,
    username: "Wilton Hunt",
  },
];
