import Link from 'next/link';

const CategoryCard = (props: any) => {
  const { data } = props;
  const slug = data?.slug || (data?.title || data?.name || '').toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

  return (
    <Link href={`/packages?category=${slug}`}>
      <div className="w-[252px] h-[344px] text-white rounded-[5px] cursor-pointer relative overflow-hidden group">
        <img src={data.img} alt={data.title} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute top-0 left-0 w-full h-full bg-black/20" />
        <span className="absolute top-4 left-4 font-light text-sm">{data.desc}</span>
        <span className="absolute top-10 left-4 text-2xl font-bold max-w-[80%] leading-tight">{data.title}</span>
      </div>
    </Link>
  )
}

export default CategoryCard;
