// @ts-nocheck
"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import Swal from 'sweetalert2';
import './Pay.scss';

const PayContent = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const packageType = searchParams.get('tier') || 'basic';
  const navigate = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosFetch.post(`/orders/create-payment-intent/${id}`, { packageType });
        if (data?.url) {
          window.location.href = data.url;
        } else if (data?.error) {
          Swal.fire('Error', data.message || 'Payment creation failed.', 'error');
          setTimeout(() => navigate.push('/packages'), 2000);
        }
      } catch (error) {
        console.error('Redirect to checkout failed:', error);
        Swal.fire('Error', error.response?.data?.message || 'Package not found or payment failed.', 'error');
        setTimeout(() => navigate.push('/packages'), 2000);
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