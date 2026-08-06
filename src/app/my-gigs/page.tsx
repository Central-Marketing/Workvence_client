"use client";

import toast from 'react-hot-toast';
import { useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";


import { Loader } from "@/components";
import './MyGigs.scss';

const MyGigs = () => {
  const user = useUserStore((state: any) => state.user);
  const navigate = useRouter();

  const queryClient = useQueryClient();
  const { isLoading, error, data = [] } = useQuery({
    queryKey: ['my-gigs'],
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
      queryClient.invalidateQueries({ queryKey: ['my-gigs'] })
  });

  const handleGigDelete = (gig: any) => {
    mutation.mutate(gig._id);
    toast.success(gig.title + ' deleted successfully!');
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className='myGigs'>
      {
        isLoading
          ? <div className='loader'> <Loader size={45} /> </div>
          : error
            ? <div className="error-message">Something went wrong</div>
            : <div className="container">
                <div className="card">
                  <div className="card-header">
                    <div className="header-info">
                      <h1>My Gigs</h1>
                      <p>Manage your published service listings</p>
                    </div>
                    <Link href='/organize' className='link'>
                      <button className="add-btn">Add New Gig</button>
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
                          data.map((gig: any) => (
                            <tr key={gig._id} onClick={() => navigate.push(`/gig/${gig._id}`)} className="clickable-row">
                              <td>
                                <img
                                  className="cover-img"
                                  src={gig.cover}
                                  alt=""
                                />
                              </td>
                              <td className="title-cell">{gig.title}</td>
                              <td className="price-cell">{gig.price.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}</td>
                              <td className="sales-cell">{gig.sales}</td>
                              <td>
                                <button 
                                  className='delete-btn' 
                                  onClick={(e: any) => { 
                                    e.stopPropagation(); 
                                    handleGigDelete(gig); 
                                  }}
                                >
                                  Delete
                                </button>
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

export default MyGigs;