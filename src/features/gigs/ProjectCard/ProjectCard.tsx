import Link from 'next/link';

const ProjectCard = (props: any) => {
  const { data } = props;

  return (
    <Link href='/'>
      <div className="w-[300px] h-[300px] rounded-[5px] cursor-pointer overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition bg-white flex flex-col group">
        <div className="h-[70%] w-full overflow-hidden">
          <img src={data.img} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        </div>
        <div className="h-[30%] flex items-center p-4 gap-4">
          <img src={data.pp} alt={data.title} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          <div className="flex flex-col truncate">
            <h2 className="text-[14px] font-semibold text-gray-800 truncate">{data.cat}</h2>
            <span className="text-[13px] text-gray-500 font-medium truncate">{data.username}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProjectCard;
