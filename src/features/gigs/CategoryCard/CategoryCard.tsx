import React from 'react';
import Link from 'next/link';
import { CardItem } from '@/types';

export interface CategoryCardProps {
  data: CardItem | any;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ data }) => {
  return (
    <Link href={`/packages?category=${data?.slug}`}>
      <div className="relative h-[345px] text-white rounded-[5px] mx-[10px] cursor-pointer">
        <img src={data?.img} alt={data?.title} className="rounded-[5px] w-full h-full object-cover" />
        <span className="font-light absolute top-[15px] left-[15px]">{data?.desc}</span>
        <span className="font-medium text-[24px] absolute top-[40px] left-[15px]">{data?.title}</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
