"use client";

import toast from 'react-hot-toast';
import { useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";


import { Loader } from "@/components";
import './MyPackages.scss';

const MyPackages = () => {
  const user = useUserStore((state: any) => state.user);
  const navigate = useRouter();

  const queryClient = useQueryClient();
  const { isLoading, error, data = [] } = useQuery({
    queryKey: ['my-packages'],
    queryFn: () =>
      axiosFetch(`/gigs?userID=${user._id}`)
        .then(({ data }) => data)
        .catch(({ response }) => {
          console.log(response.data);
        })
  });

  const mutation = useMutation({
    mutationFn: (_id) =>
      axiosFetch.delete(`/gigs/${_id}`)
    ,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['my-packages'] })
  });

  const handlePackageDelete = (pkg: any) => {
    mutation.mutate(pkg._id);
    toast.success(pkg.title + ' deleted successfully!');
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className='myPackages'>
      {
        isLoading
          ? <div className='loader'> <Loader size={45} /> </div>
          : error
            ? <div className="error-message">Something went wrong</div>
            : <div className="container">
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
                        {
                          data.map((pkg: any) => (
                            <tr key={pkg._id} onClick={() => navigate.push(`/package/${pkg._id}`)} className="clickable-row">
                              <td>
                                <img
                                  className="cover-img"
                                  src={pkg.cover}
                                  alt=""
                                />
                              </td>
                              <td className="title-cell">{pkg.title}</td>
                              <td className="price-cell">{pkg.price.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}</td>
                              <td className="sales-cell">{pkg.sales}</td>
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
                                        handlePackageDelete(pkg); 
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      }
    </div>
  )
}

export default MyPackages;