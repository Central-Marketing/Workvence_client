// @ts-nocheck
"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import toast from 'react-hot-toast';
import './Pay.scss';

const Pay = () => {
  const { _id } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosFetch.post(`/orders/create-payment-intent/${_id}`);
        if (data?.url) {
          window.location.href = data.url;
        } else if (data?.error) {
          toast.error(data.message || 'Payment creation failed.');
          setTimeout(() => navigate.push('/gigs'), 2000);
        }
      } catch (error) {
        console.error('Redirect to checkout failed:', error);
        toast.error(error.response?.data?.message || 'Gig not found or payment failed.');
        setTimeout(() => navigate.push('/gigs'), 2000);
      }
    })();
    window.scrollTo(0, 0);
  }, [_id, navigate]);

  return (
    <div className='pay' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55vh', gap: '20px' }}>
      <Loader size={45} />
      <h2 style={{ color: '#1e293b', fontWeight: 500 }}>Redirecting to secure payment checkout...</h2>
    </div>
  );
};

export default Pay;