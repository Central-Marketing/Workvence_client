import React from 'react';
import Link from 'next/link';
import { ProjectItem } from '@/types';
import './ProjectCard.scss';

export interface ProjectCardProps {
  data: ProjectItem | any;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ data }) => {
  return (
    <Link className='link' href='/'>
      <div className='projectContainer'>
        <img src={data?.img} alt={data?.cat || 'Project'} />
        <div className="info">
          <img src={data?.pp} alt={data?.username || 'User'} />
          <div className="text">
            <h2>{data?.cat}</h2>
            <span>{data?.username}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
