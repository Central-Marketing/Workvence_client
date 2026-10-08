"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Button, GigsGridSkeleton, AccountStandingBanner, Modal } from "@/components/ui";

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
    <div className="min-h-screen bg-[#F8F9FA] pt-10 sm:pt-12 pb-[80px] min-[1400px]:pb-[100px] font-sans">
      {isLoading ? (
        <div className="container mx-auto px-4 md:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-medium font-inter text-[#292929]">
                My Packages
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                Manage, edit, and organize all your services in one place.
              </p>
            </div>
          </div>
          <GigsGridSkeleton count={6} />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold py-20">
          Something went wrong loading your packages!
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 space-y-6">
          {/* Account Standing Warning / Suspension Banner */}
          <AccountStandingBanner />

          {/* Page Heading & Create New Package Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-medium font-inter text-[#292929]">
                My Packages
              </h1>
              <p className="text-xs sm:text-[13px] text-gray-500 mt-1.5 leading-relaxed max-w-2xl">
                Create, manage, and showcase your service packages in one place. Track your package status and keep your offerings ready for clients.
              </p>
            </div>

            {user?.isSuspended ? (
              <Button
                variant="outline"
                size="sm"
                radius="fiverr"
                disabled
                onClick={() => toast.error("Account is suspended. Package creation is temporarily disabled.")}
                className="bg-gray-200 text-gray-500 border-transparent shadow-none cursor-not-allowed opacity-75 self-start sm:self-auto shrink-0"
              >
                Create New Package (Suspended)
              </Button>
            ) : (
              <Button
                href="/organize"
                variant="outline"
                size="sm"
                radius="fiverr"
                className="bg-gradient-to-r from-[#98FDE8] to-[#80B6FD] hover:opacity-95 text-[#0A3B32] border-transparent shadow-2xs self-start sm:self-auto shrink-0"
              >
                Create New Package
              </Button>
            )}
          </div>

          {/* Tab Filter: Published and Draft */}
          <div className="inline-flex items-center h-[46px] bg-[#F4F4F6] p-[4px] rounded-[6px] border border-gray-200/50">
            <Button
              type="button"
              onClick={() => setActiveTab("published")}
              size="sm"
              radius="fiverr"
              variant={activeTab === "published" ? "brand" : "ghost"}
              className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-4 whitespace-nowrap ${activeTab === "published"
                ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                }`}
            >
              <span className="whitespace-nowrap shrink-0">Published</span>
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none shrink-0 ${activeTab === "published"
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
              className={`h-full font-sf-pro font-medium text-[14px] sm:text-[15px] px-4 whitespace-nowrap ${activeTab === "draft"
                ? "bg-[#0B403F] hover:bg-[#0B403F] text-white shadow-sm"
                : "bg-transparent hover:bg-transparent text-[#6E6E6E] hover:text-[#222427]"
                }`}
            >
              <span className="whitespace-nowrap shrink-0">Draft</span>
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none shrink-0 ${activeTab === "draft"
                  ? "bg-white/20 text-white"
                  : "bg-white border border-[rgba(0,0,0,0.10)] text-yellow-600"
                  }`}
              >
                {draftPackages.length}
              </span>
            </Button>
          </div>

          {/* Main Card Container */}
          <div className="p-7 bg-[#f5f5f5] rounded-[6px]">
            <div className="w-full overflow-x-auto scrollbar-thin [-webkit-overflow-scrolling:touch] bg-white rounded-[6px] border border-[rgba(0,0,0,0.10)]">

              {/* Packages Table */}
              <table className="w-full  min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-base  font-sf-pro font-bold text-[#434343]">
                    <th className="py-3 px-4 ">Package Name</th>
                    <th className="py-3 px-4 whitespace-nowrap">Price</th>
                    <th className="py-3 px-4 whitespace-nowrap">Sales</th>
                    <th className="py-3 px-4 whitespace-nowrap ">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {currentPackages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-10 h-10 rounded-[6px] bg-white border border-[rgba(0,0,0,0.10)] flex items-center justify-center text-[#0D6D5F] text-xl mb-3 shadow-2xs">
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
                    currentPackages.map((pkg: any, idx: number) => {
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
                          className={`group relative cursor-pointer transition-colors ${idx % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"
                            } after:pointer-events-none after:absolute after:inset-0`}
                        >
                          {/* Package Name & Thumbnail */}
                          <td className="py-3 px-4 align-middle max-w-[380px]">
                            <div className="flex items-center gap-4">
                              <img
                                src={coverImage}
                                alt={pkg.title || "Package Cover"}
                                className="w-24 sm:w-28 h-14 sm:h-16 rounded-[6px] object-cover bg-gray-100 border border-gray-200/80 shrink-0"
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
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-amber-700 border border-amber-200/80 w-fit">
                                      Draft
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200/80 w-fit">
                                      Published
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 align-middle text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                            {(pkg.price || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </td>

                          {/* Sales */}
                          <td className="py-3 px-4 align-middle text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                            {salesCount} {salesCount === 1 ? "Sale" : "Sales"}
                          </td>

                          {/* Action Buttons: Edit (Pencil) & Delete (Red Trash) */}
                          <td className="py-3 px-4 align-middle text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
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
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                  <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke="#292929" stroke-width="1.5" stroke-linejoin="round" />
                                  <path d="M13 4L20 11" stroke="#292929" stroke-width="1.5" stroke-linejoin="round" />
                                  <path d="M14 22H22" stroke="#292929" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>}
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
      <Modal
        isOpen={Boolean(packageToDelete)}
        onClose={() => !mutation.isPending && setPackageToDelete(null)}
        title="Delete Package?"
        isLoading={mutation.isPending}
        footer={
          <>
            <Button
              type="button"
              variant="soft"
              size="md"
              radius="fiverr"
              onClick={() => setPackageToDelete(null)}
              disabled={mutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              radius="fiverr"
              onClick={() => confirmDelete()}
              disabled={mutation.isPending}
              isLoading={mutation.isPending}
              loadingText="Deleting..."
              className="cursor-pointer"
            >
              Yes, Delete
            </Button>
          </>
        }
      >
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sf-pro">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-slate-800">
            &quot;{packageToDelete?.title}&quot;
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default MyPackages;