// @ts-nocheck
"use client";

import React, { useEffect, Suspense } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import { Loader } from "@/components";
import './Pay.scss';

// Module-level deduplication set to persist across React 18/19 Suspense remounts
const activePaymentIntents = new Set<string>();

const PayContent = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const packageType = searchParams.get('tier') || 'basic';
  const navigate = useRouter();

  useEffect(() => {
    if (!id) return;
    const requestKey = `${id}-${packageType}`;
    
    // Prevent duplicate concurrent requests across Suspense hydration & StrictMode
    if (activePaymentIntents.has(requestKey)) return;
    activePaymentIntents.add(requestKey);

    (async () => {
      try {
        const { data } = await axiosFetch.post(`/orders/create-payment-intent/${id}`, { packageType });
        if (data?.url) {
          window.location.href = data.url;
        } else if (data?.error) {
          toast.error(data.message || 'Payment creation failed.');
          setTimeout(() => {
            activePaymentIntents.delete(requestKey);
            navigate.push('/packages');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Redirect to checkout failed:', error);
        toast.error(error.response?.data?.message || 'Package not found or payment failed.');
        setTimeout(() => {
          activePaymentIntents.delete(requestKey);
          navigate.push('/packages');
        }, 2000);
      }
    })();
    window.scrollTo(0, 0);
  }, [id, navigate, packageType]);

  return (
    <div className='pay' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55vh', gap: '20px' }}>
      <Loader size={45} />
      <h2 style={{ color: '#1e293b', fontWeight: 500 }}>Redirecting to secure payment checkout...</h2>
    </div>
  );
};

export default function Pay() {
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader size={45} /></div>}>
      <PayContent />
    </React.Suspense>
  );
}