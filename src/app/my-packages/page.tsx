"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import './MyPackages.scss';

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
    <div className='myPackages min-h-screen relative'>
      {isLoading ? (
        <div className='loader'>
          <Loader size={45} />
        </div>
      ) : error ? (
        <div className="error-message">Something went wrong</div>
      ) : (
        <div className="container">
          <div className="card">
            <div className="card-header">
              <div className="header-info">
                <h1>My Packages</h1>
                <p>Manage your published service listings</p>
              </div>
              <Link href='/organize' className='link'>
                <button className="add-btn">Add New Package</button>
              </Link>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Sales</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((pkg: any) => (
                    <tr
                      key={pkg._id}
                      onClick={() => navigate.push(`/package/${pkg._id}`)}
                      className="clickable-row"
                    >
                      <td>
                        <img
                          className="cover-img"
                          src={pkg.cover}
                          alt={pkg.title || 'Package Cover'}
                        />
                      </td>
                      <td className="title-cell">{pkg.title}</td>
                      <td className="price-cell">
                        {(pkg.price || 0).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </td>
                      <td className="sales-cell">{pkg.sales || 0}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className='edit-btn'
                            onClick={(e: any) => {
                              e.stopPropagation();
                              navigate.push(`/organize/${pkg._id}`);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className='delete-btn'
                            onClick={(e: any) => {
                              e.stopPropagation();
                              setPackageToDelete(pkg);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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