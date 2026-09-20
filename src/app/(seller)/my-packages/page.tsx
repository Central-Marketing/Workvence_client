"use client";

import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import { FiHome, FiEdit2, FiTrash2 } from "react-icons/fi";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, Button } from "@/components";

const MyPackages = () => {
  const user = useUserStore((state: any) => state.user);
  const router = useRouter();
  const [packageToDelete, setPackageToDelete] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"published" | "draft">("published");

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

  const packagesList = Array.isArray(data)
    ? data
    : (data?.packages || data?.gigs || data?.data || []);

  const isPackageDraft = (pkg: any) =>
    Boolean(pkg.isDraft) === true || pkg.isDraft === "true" || pkg.status === "draft";

  const publishedPackages = useMemo(() => {
    return packagesList.filter((pkg: any) => !isPackageDraft(pkg));
  }, [packagesList]);

  const draftPackages = useMemo(() => {
    return packagesList.filter((pkg: any) => isPackageDraft(pkg));
  }, [packagesList]);

  const currentPackages = activeTab === "published" ? publishedPackages : draftPackages;

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

            <Button
              href="/organize"
              variant="outline"
              size="sm"
              radius="fiverr"
              className="bg-gradient-to-r from-[#98FDE8] to-[#80B6FD] hover:opacity-95 text-[#0A3B32] border-transparent shadow-2xs self-start sm:self-auto shrink-0"
            >
              Create New Package
            </Button>
          </div>

          {/* Tab Filter: Published and Draft */}
          <div className="bg-[#F1F3F5] rounded-xl p-1 inline-flex items-center gap-1 shadow-2xs">
            <Button
              type="button"
              onClick={() => setActiveTab("published")}
              size="sm"
              radius="fiverr"
              variant={activeTab === "published" ? "brand" : "ghost"}
              className={
                activeTab === "published"
                  ? "bg-[#0B3A33] hover:bg-[#0B3A33] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              <span>Published</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1.5 ${
                  activeTab === "published"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200/80 text-gray-700"
                }`}
              >
                {publishedPackages.length}
              </span>
            </Button>

            <Button
              type="button"
              onClick={() => setActiveTab("draft")}
              size="sm"
              radius="fiverr"
              variant={activeTab === "draft" ? "brand" : "ghost"}
              className={
                activeTab === "draft"
                  ? "bg-[#0B3A33] hover:bg-[#0B3A33] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              <span>Draft</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1.5 ${
                  activeTab === "draft"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {draftPackages.length}
              </span>
            </Button>
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
                  {currentPackages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0D6D5F] text-xl mb-3 shadow-2xs">
                            <FiEdit2 />
                          </div>
                          <p className="text-slate-800 font-semibold text-sm sm:text-base mb-1">
                            {activeTab === "draft" ? "No draft packages" : "No published packages yet"}
                          </p>
                          <p className="text-slate-400 text-xs sm:text-[13px] mb-4">
                            {activeTab === "draft"
                              ? "You don't have any packages saved as drafts."
                              : "You haven't published any packages yet. Click \"Create New Package\" to publish your first offering!"}
                          </p>
                          <Button
                            href="/organize"
                            variant="dark"
                            size="sm"
                            radius="fiverr"
                          >
                            Create New Package
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentPackages.map((pkg: any) => {
                      const coverImage =
                        pkg.cover ||
                        pkg.image ||
                        pkg.coverImage ||
                        (Array.isArray(pkg.images) && pkg.images[0]) ||
                        "/images/dashboard/orders/order_1.png";
                      const salesCount = pkg.sales || pkg.salesCount || pkg.ordersCount || 0;

                      return (
                        <tr
                          key={pkg._id}
                          onClick={() => {
                            if (isPackageDraft(pkg)) {
                              router.push(`/organize/${pkg._id}`);
                            } else {
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
                              <div className="flex flex-col gap-1 min-w-0">
                                <span
                                  className="text-xs sm:text-[13.5px] font-normal text-gray-800 line-clamp-2 leading-relaxed"
                                  title={pkg.title}
                                >
                                  {pkg.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isPackageDraft(pkg) ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 w-fit">
                                      Draft
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-fit">
                                      Published
                                    </span>
                                  )}
                                </div>
                              </div>
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
                              <Button
                                type="button"
                                title="Edit package"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/organize/${pkg._id}`);
                                }}
                                variant="outline"
                                size="icon"
                                radius="full"
                                className="w-8 h-8 min-w-[32px] min-h-[32px] p-0 shadow-2xs"
                                icon={<FiEdit2 className="text-xs" />}
                              />

                              {/* Delete Button */}
                              <Button
                                type="button"
                                title="Delete package"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPackageToDelete(pkg);
                                }}
                                variant="danger-soft"
                                size="icon"
                                radius="full"
                                className="w-8 h-8 min-w-[32px] min-h-[32px] p-0 bg-white hover:bg-red-50 border-red-100 text-red-500 shadow-2xs"
                                icon={<FiTrash2 className="text-xs" />}
                              />
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="full"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 w-8 h-8 min-h-[32px] p-0"
              onClick={() => setPackageToDelete(null)}
              disabled={mutation.isPending}
              icon={<X size={20} />}
            />

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
              <Button
                type="button"
                variant="outline"
                size="md"
                radius="fiverr"
                className="flex-1"
                onClick={() => setPackageToDelete(null)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                size="md"
                radius="fiverr"
                className="flex-1"
                onClick={() => confirmDelete()}
                disabled={mutation.isPending}
                isLoading={mutation.isPending}
              >
                {mutation.isPending ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPackages;