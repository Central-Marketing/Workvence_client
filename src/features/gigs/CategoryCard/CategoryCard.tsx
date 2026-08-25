import React from 'react';
import Link from 'next/link';
import { CardItem } from '@/types';
import './CategoryCard.scss';

export interface CategoryCardProps {
  data: CardItem | any;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ data }) => {
  return (
    <Link href={`/packages?category=${data?.slug}`}>
      <div className='cardContainer'>
        <img src={data?.img} alt={data?.title} />
        <span className='desc'>{data?.desc}</span>
        <span className='title'>{data?.title}</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
