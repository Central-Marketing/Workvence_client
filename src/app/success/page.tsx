// @ts-nocheck
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";


import "./Success.scss";

const Success = () => {
  const searchParams = useSearchParams(); const search = searchParams.toString();;
  const navigate = useRouter();
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");
  const user = useUserStore((state: any) => state.user);

  useEffect(() => {
    (async () => {
      try {
        await axiosFetch.patch("/orders", { payment_intent });
        setTimeout(() => {
          navigate.push("/orders");
        }, 5000);
      } catch ({ response }) {
        console.log(response.data.message);
      }
    })();
  }, []);

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
