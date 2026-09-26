import React from 'react';
import Link from 'next/link';
import { ProjectItem } from '@/types';

export interface ProjectCardProps {
  data: ProjectItem | any;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
  return (
    <Link className="link" href="/">
      <div className="h-[320px] cursor-pointer mx-[10px] rounded-[5px]">
        <img
          src={data?.img}
          alt={data?.cat || 'Project'}
          className="rounded-t-[5px] w-full h-[70%] object-cover"
        />
        <div className="flex items-center gap-5 p-[15px] shadow-[0_0.14px_2.29px_rgba(0,0,0,0.032),0_0.37px_4.43px_rgba(0,0,0,0.048),0_3px_7px_rgba(0,0,0,0.09)]">
          <img
            src={data?.pp}
            alt={data?.username || 'User'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="text-[14px] text-[#404145] leading-[21px] font-semibold">
              {data?.cat}
            </h2>
            <span className="text-[14px]">{data?.username}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
