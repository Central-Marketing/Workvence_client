import Link from 'next/link';
import {
  MonitorCheck,
  Megaphone,
  PenTool,
  Clapperboard,
  Box,
  Scissors,
  Code2,
  Database
} from 'lucide-react';

const ExploreCategories = () => {
  const categories = [
    {
      title: "Graphic & Design",
      icon: <MonitorCheck className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "design"
    },
    {
      title: "Digital Marketing",
      icon: <Megaphone className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "social"
    },
    {
      title: "Writing & Translation",
      icon: <PenTool className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "books"
    },
    {
      title: "Video & Animation",
      icon: <Clapperboard className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "video"
    },
    {
      title: "Animation & 3D",
      icon: <Box className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "video"
    },
    {
      title: "Video & Editing",
      icon: <Scissors className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "video"
    },
    {
      title: "Programming & Tech",
      icon: <Code2 className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "wordpress"
    },
    {
      title: "Data & Intelligence",
      icon: <Database className="text-gray-700" size={32} strokeWidth={1.5} />,
      path: "ai"
    }
  ];

  return (
    <section className="w-full py-16 md:py-20 bg-white">
      <div className="w-full container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-600 mb-2">Explore Top Categories</h2>
          <p className="text-gray-500 text-lg">Explore a wide range of services organized by category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              href={`/gigs?category=${category.path}`}
              key={index}
              className="flex flex-col p-6 bg-white border border-gray-100 rounded-[1.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 group"
            >
              <div className="mb-8">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-brand-green/10 transition-colors duration-300">
                  {category.icon}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 leading-tight group-hover:text-brand-green transition-colors duration-300">
                {category.title.split(' & ').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i !== arr.length - 1 && <>&nbsp;&<br className="hidden md:block" /></>}
                  </span>
                ))}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreCategories;
