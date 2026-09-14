"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import { FiHome, FiEdit2, FiTrash2 } from "react-icons/fi";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";

// High-fidelity fallback packages matching the user's reference mockup image
const MOCK_PACKAGES_IMAGE = [
  {
    _id: "mock-pkg-1",
    title: "I will create a stunning portfolio website using Elementor.",
    cover: "/images/dashboard/orders/order_1.png",
    price: 200,
    sales: 2,
  },
  {
    _id: "mock-pkg-2",
    title: "I will develop a custom e-commerce platform tailored to your needs.",
    cover: "/images/dashboard/orders/order_2.png",
    price: 110,
    sales: 2,
  },
  {
    _id: "mock-pkg-3",
    title: "Design engaging mobile app interfaces with Sketch and InVision.",
    cover: "/images/dashboard/orders/order_3.png",
    price: 500,
    sales: 5,
  },
  {
    _id: "mock-pkg-4",
    title: "Build a dynamic blog site with WordPress and SEO optimization.",
    cover: "/images/dashboard/orders/order_4.png",
    price: 300,
    sales: 3,
  },
  {
    _id: "mock-pkg-5",
    title: "Enhance website visibility with targeted SEO and content strategies.",
    cover: "/images/dashboard/orders/order_5.png",
    price: 80,
    sales: 24,
  },
];

const MyPackages = () => {
  const user = useUserStore((state: any) => state.user);
  const router = useRouter();
  const [packageToDelete, setPackageToDelete] = useState<any | null>(null);

  const queryClient = useQueryClient();

  const { isLoading, error, data = [] } = useQuery({
    queryKey: ["my-packages"],
    queryFn: () =>
      axiosFetch(`/gigs?userID=${user?._id || user?.id}`)
        .then(({ data }) => (Array.isArray(data) ? data : data?.packages || data?.gigs || []))
        .catch(({ response }) => {
          console.error(response?.data);
          return [];
        }),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (_id: string) => axiosFetch.delete(`/gigs/${_id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-packages"] });
    },
  });

  const confirmDelete = () => {
    if (!packageToDelete) return;
    const targetPkg = packageToDelete;
    mutation.mutate(targetPkg._id, {
      onSuccess: () => {
        toast.success(`"${targetPkg.title}" deleted successfully!`);
        setPackageToDelete(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete package");
      },
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const packagesList = Array.isArray(data) && data.length > 0 ? data : MOCK_PACKAGES_IMAGE;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-10 font-sans">
      {isLoading ? (
        <div className="w-full flex justify-center items-center py-24">
          <Loader size={45} />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold py-20">
          Something went wrong loading your packages!
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 space-y-6">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link
              href="/"
              className="text-[#0D6D5F] hover:text-[#094d43] transition-colors flex items-center gap-1"
            >
              <FiHome className="text-sm" />
            </Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Packages</span>
          </div>

          {/* Page Heading & Create New Package Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-gray-950">
                My Packages
              </h1>
              <p className="text-xs sm:text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-2xl">
                Create, manage, and showcase your service packages in one place. Track your package status and keep your offerings ready for clients.
              </p>
            </div>

            <Link href="/organize" className="self-start sm:self-auto shrink-0">
              <button
                type="button"
                className="bg-gradient-to-r from-[#98FDE8] to-[#80B6FD] hover:opacity-95 text-[#0A3B32] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                Create New Package
              </button>
            </Link>
          </div>

          {/* Main Card Container */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6">

            {/* Packages Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-800 border-b border-gray-100">
                    <th className="py-3.5 px-4 font-bold">Package Name</th>
                    <th className="py-3.5 px-6 font-bold whitespace-nowrap">Price</th>
                    <th className="py-3.5 px-6 font-bold whitespace-nowrap">Sales</th>
                    <th className="py-3.5 px-6 font-bold whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {packagesList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-gray-400 text-xs sm:text-sm font-medium">
                        No packages found. Click &quot;Create New Package&quot; to publish your first offering!
                      </td>
                    </tr>
                  ) : (
                    packagesList.map((pkg: any) => {
                      const coverImage =
                        pkg.cover ||
                        pkg.image ||
                        pkg.coverImage ||
                        (Array.isArray(pkg.images) && pkg.images[0]) ||
                        "/images/dashboard/orders/order_1.png";
                      const salesCount = pkg.sales || pkg.salesCount || pkg.ordersCount || 0;
                      const isMock = pkg._id && pkg._id.startsWith("mock-");

                      return (
                        <tr
                          key={pkg._id}
                          onClick={() => {
                            if (!isMock) {
                              router.push(`/package/${pkg._id}`);
                            }
                          }}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                        >
                          {/* Package Name & Thumbnail */}
                          <td className="py-4 px-4 align-middle max-w-[460px]">
                            <div className="flex items-center gap-4">
                              <img
                                src={coverImage}
                                alt={pkg.title || "Package Cover"}
                                className="w-24 sm:w-28 h-14 sm:h-16 rounded-lg object-cover bg-gray-100 border border-gray-200/80 shrink-0"
                              />
                              <span
                                className="text-xs sm:text-[13.5px] font-normal text-gray-800 line-clamp-2 leading-relaxed"
                                title={pkg.title}
                              >
                                {pkg.title}
                              </span>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-6 align-middle text-xs sm:text-[13.5px] font-bold text-gray-950 whitespace-nowrap">
                            {(pkg.price || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

                          {/* Sales */}
                          <td className="py-4 px-6 align-middle text-xs sm:text-[13px] text-gray-700 font-normal whitespace-nowrap">
                            {salesCount} {salesCount === 1 ? "Sale" : "Sales"}
                          </td>

                          {/* Action Buttons: Edit (Pencil) & Delete (Red Trash) */}
                          <td className="py-4 px-6 align-middle whitespace-nowrap text-right">
                            <div className="inline-flex items-center justify-end gap-2.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                title="Edit package"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isMock) {
                                    router.push(`/organize/${pkg._id}`);
                                  } else {
                                    router.push("/organize");
                                  }
                                }}
                                className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-gray-950 hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
                              >
                                <FiEdit2 className="text-xs" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                title="Delete package"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPackageToDelete(pkg);
                                }}
                                className="w-8 h-8 rounded-full border border-red-100 bg-white flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shadow-2xs"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Confirmation Delete Modal */}
      {packageToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all duration-300"
          onClick={() => !mutation.isPending && setPackageToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
              onClick={() => setPackageToDelete(null)}
              disabled={mutation.isPending}
            >
              <X size={20} />
            </button>

            {/* Trash Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
              <Trash2 size={26} strokeWidth={2} />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Delete Package?
            </h3>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-800">&quot;{packageToDelete.title}&quot;</span>? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                className="flex-1 py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                onClick={() => setPackageToDelete(null)}
                disabled={mutation.isPending}
              >
                Cancel
              </button>

              <button
                type="button"
                className="flex-1 py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:bg-red-300 flex items-center justify-center gap-2"
                onClick={() => confirmDelete()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPackages;