import { Metadata } from 'next';
import { getSingleGig } from '@/services/gigService.server';
import PackageDetailClient from './PackageDetailClient';

export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const gig = await getSingleGig(id);

  if (!gig) {
    return {
      title: 'Service Package | Workvence',
      description: 'Explore high-quality freelance services on Workvence.',
    };
  }

  const title = gig.title ? `${gig.title} | Workvence` : 'Freelance Service Package | Workvence';
  const description = gig.shortDesc || (typeof gig.desc === 'string' ? gig.desc.slice(0, 160) : '') || 'Find the perfect freelance service on Workvence.';
  const image = gig.cover || (Array.isArray(gig.images) && gig.images[0]) || '/favicon.ico';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          alt: gig.title || 'Workvence Gig',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const gig = await getSingleGig(id);

  return <PackageDetailClient initialPackage={gig} />;
}