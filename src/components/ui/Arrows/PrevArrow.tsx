import { ChevronLeft } from 'lucide-react';

const PrevArrow = (props: any) => {
    const { onClick } = props;
  
    return (
      <div 
        className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-4 w-12 h-12 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition z-10"
        onClick={onClick}
      >
        <ChevronLeft className="text-3xl text-gray-600" />
      </div>
    )
}

export default PrevArrow;