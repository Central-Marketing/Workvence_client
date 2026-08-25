"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";

import "./Success.scss";

const Success: React.FC = () => {
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const payment_intent = searchParams.get("payment_intent");
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    (async () => {
      try {
        await axiosFetch.patch("/orders", { payment_intent });
        setTimeout(() => {
          navigate.push("/orders");
        }, 5000);
      } catch (err: any) {
        console.log(err?.response?.data?.message || err?.message);
      }
    })();
  }, [navigate, payment_intent]);

  return (
    <div className="pay-message">
      Payment successful. You are being redirected to the orders page. Please do
      not close the page
    </div>
  );
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="success-loading"><Loader size={45} /></div>}>
      <Success />
    </Suspense>
  );
}
