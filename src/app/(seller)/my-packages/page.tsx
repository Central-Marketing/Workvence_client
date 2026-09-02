"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle, X, Plus, Edit2, Package } from 'lucide-react';
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";

const MyPackages = () => {
  const user = useUserStore((state: any) => state.user);
  const navigate = useRouter();
  const [packageToDelete, setPackageToDelete] = useState<any | null>(null);

  const queryClient = useQueryClient();

  const { isLoading, error, data = [] } = useQuery({
    queryKey: ['my-packages'],
    queryFn: () =>
      axiosFetch(`/gigs?userID=${user?._id || user?.id}`)
        .then(({ data }) => data)
        .catch(({ response }) => {
          console.error(response?.data);
          return [];
        })
  });

  const mutation = useMutation({
    mutationFn: (_id: string) => axiosFetch.delete(`/gigs/${_id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-packages'] });
    }
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
        toast.error(err?.response?.data?.message || 'Failed to delete package');
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[85vh] bg-slate-50 py-8 sm:py-12 flex justify-center font-sans relative">
      {isLoading ? (
        <div className="w-full flex justify-center items-center py-24">
          <Loader size={45} />
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-semibold text-lg">Failed to load packages</p>
            <p className="text-sm text-red-600 mt-1">Please check your internet connection and refresh the page</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 max-w-6xl flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Packages</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-brand-green border border-emerald-200">
                    {data.length} {data.length === 1 ? 'Listing' : 'Listings'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Manage and organize your published service listings</p>
              </div>

              <Link href="/organize" className="inline-block">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-[#059669] text-white font-semibold text-sm shadow-sm hover:shadow transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Add New Package</span>
                </button>
              </Link>
            </div>

            {/* Empty State vs Table */}
            {data.length === 0 ? (
              <div className="py-16 px-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 border border-slate-200">
                  <Package size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No packages created yet</h3>
                <p className="text-sm text-slate-500 max-w-md mb-6">
                  Create and publish your first package to start offering services and getting client orders.
                </p>
                <Link href="/organize">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-[#059669] text-white font-semibold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Create Your First Package</span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75">
                      <th className="py-4 px-5 sm:px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Image</th>
                      <th className="py-4 px-5 sm:px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                      <th className="py-4 px-5 sm:px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                      <th className="py-4 px-5 sm:px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Sales</th>
                      <th className="py-4 px-5 sm:px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((pkg: any) => (
                      <tr
                        key={pkg._id}
                        onClick={() => navigate.push(`/package/${pkg._id}`)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-5 sm:px-6 align-middle">
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                            <img
                              src={pkg.cover || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"}
                              alt={pkg.title || 'Package Cover'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-5 sm:px-6 align-middle">
                          <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors line-clamp-1 max-w-sm sm:max-w-md">
                            {pkg.title}
                          </div>
                          {pkg.cat && (
                            <span className="text-xs text-slate-400 capitalize mt-0.5 block">
                              {pkg.cat}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 sm:px-6 align-middle whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {(pkg.price || 0).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-5 sm:px-6 align-middle whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {pkg.sales || 0} sales
                          </span>
                        </td>
                        <td className="py-4 px-5 sm:px-6 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-brand-green border border-emerald-200 hover:bg-brand-green hover:text-white hover:border-brand-green transition-all duration-150 cursor-pointer shadow-2xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate.push(`/organize/${pkg._id}`);
                              }}
                              title="Edit package"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-150 cursor-pointer shadow-2xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPackageToDelete(pkg);
                              }}
                              title="Delete package"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  'Yes, Delete'
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