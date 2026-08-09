// @ts-nocheck
"use client";

import toast from 'react-hot-toast';
import { useEffect, useReducer, useState } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { packageReducer, initialState } from '@/reducers/packageReducer';
import { axiosFetch, generateImageURL } from '@/utils';

import { useUserStore } from "@/store/userStore";
import { CustomSelect } from '@/components';
const Add = () => {
  const user = useUserStore((state: any) => state.user);
  const [state, dispatch] = useReducer(packageReducer, initialState);
  const [coverImage, setCoverImage] = useState(null);
  const [packageImages, setPackageImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const navigate = useRouter();
  const queryClient = useQueryClient();

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => axiosFetch.get('/admin/categories').then(({ data }) => data)
  });

  const categoryList = Array.isArray(fetchedCategories) ? fetchedCategories : fetchedCategories.categories || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const mutation = useMutation({
    mutationFn: (pkg: any) =>
      axiosFetch.post('/gigs', pkg)
      .then(({data}) => {
        return data;
      })
      .catch(({response}) => {
        toast.error(response.data.message);
      })
    ,
    onSuccess: () => 
      queryClient.invalidateQueries({ queryKey: ['my-packages'] })
  })

  const handleFormCange = (event: any) => {
    const { name, value } = event.target;
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name, value }
    })
  }

  const handleFormFeature = (event: any) => {
    event.preventDefault();
    dispatch({
      type: 'ADD_FEATURE',
      payload: event.target[0].value
    })
    event.target.reset();
  }

  const handleImageUploads = async () => {
    try {
      setUploading(true);
      const cover = await generateImageURL(coverImage);
      const images = await Promise.all(
        [...packageImages].map(async (img) => await generateImageURL(img))
      )
      dispatch({
        type: 'ADD_IMAGES',
        payload: { cover: cover.url, images: images.map((img) => img.url) }
      })
      setUploading(false);
      setDisabled(true);
    }
    catch (error) {
      console.log(error);
      setUploading(false);
    }
  }

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    const form = {...state, userID: user._id}
    for(let key in form) {
      if(form[key] === '' || form[key].length === 0) {
        toast.error('Please fill input field: ' + key);
        return;
      }
    }
    toast.success("Congratulations! You're on the market!")
    mutation.mutate(form);
    setTimeout(() => {
      navigate.push('/my-packages');
    }, 2000);
  }

  const inputClasses = "p-3.5 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 transition-all duration-300 w-full placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10";
  const labelClasses = "text-slate-700 text-sm font-semibold -mb-2";
  const btnClasses = "px-6 py-4 rounded-lg bg-brand-green font-semibold text-base text-white transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:bg-[#059669] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.3)] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

  return (
    <div className='min-h-screen bg-slate-50 py-10 flex justify-center font-sans'>
      <div className="w-[95%] md:w-[90%] max-w-[1100px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-8 md:py-12 md:px-16 mx-auto">
        <h1 className="text-slate-900 font-bold text-2xl md:text-3xl mb-10 border-b-2 border-slate-100 pb-5">Add New Package</h1>
        
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-16">
          <div className="flex-1 flex flex-col gap-6">
            <label className={labelClasses}>Title</label>
            <input name='title' type="text" className={inputClasses} placeholder="e.g. I will do something I'm really good at" onChange={handleFormCange} />

            <label className={labelClasses}>Category</label>
            <CustomSelect
              options={categoryList.map((item: any) => ({
                value: item.slug || item.name || item._id || String(item),
                label: item.name || (item.slug ? item.slug[0].toUpperCase() + item.slug.slice(1) : String(item))
              }))}
              value={state.category || ''}
              onChange={(val) => handleFormCange({ target: { name: 'category', value: val } })}
              placeholder="Category"
            />

            <div className="flex flex-col gap-4 p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <div className="flex flex-col gap-4 w-full">
                <label className="text-slate-700 text-sm font-semibold">Cover Image</label>
                <input type="file" accept='image/*' className="p-2.5 bg-white border border-slate-200 rounded-md cursor-pointer" onChange={(event: any) => setCoverImage(event.target.files[0])} />
                
                <label className="text-slate-700 text-sm font-semibold mt-2">Upload Images</label>
                <input type="file" accept='image/*' multiple className="p-2.5 bg-white border border-slate-200 rounded-md cursor-pointer" onChange={(event: any) => setPackageImages(event.target.files)} />
              </div>
              <button className={`${btnClasses} mt-2 px-6 py-2.5 text-sm w-auto self-start`} disabled={!!disabled} onClick={handleImageUploads}>
                {uploading ? 'Uploading...' : disabled ? 'Uploaded' : 'Upload'}
              </button>
            </div>

            <label className={labelClasses}>Description</label>
            <textarea name='description' className={`${inputClasses} min-h-[120px] resize-y`} placeholder='Brief descriptions to introduce your service to customers' onChange={handleFormCange}></textarea>
            
            <button className={`${btnClasses} mt-4`} onClick={handleFormSubmit}>Create Package</button>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <label className={labelClasses}>Service Title</label>
            <input type="text" name='shortTitle' className={inputClasses} placeholder='e.g. One-page web design' onChange={handleFormCange} />

            <label className={labelClasses}>Short Description</label>
            <textarea name='shortDesc' className={`${inputClasses} min-h-[120px] resize-y`} placeholder='Short description of your service' onChange={handleFormCange}></textarea>

            <label className={labelClasses}>Delivery Time (e.g. 3 days)</label>
            <input type="number" name='deliveryTime' min='1' className={inputClasses} onChange={handleFormCange} />

            <label className={labelClasses}>Revision Number</label>
            <input type="number" name='revisionNumber' min='1' className={inputClasses} onChange={handleFormCange} />

            <label className={labelClasses}>Add Feature</label>
            <form className='flex justify-between items-center gap-3' onSubmit={handleFormFeature}>
              <input type="text" className={`${inputClasses} flex-1`} placeholder='e.g. page design' onChange={handleFormCange} />
              <button type='submit' className={`${btnClasses} px-6 py-3.5 h-auto m-0 whitespace-nowrap`}>Add</button>
            </form>
            
            <div className="flex flex-wrap gap-2.5 mt-1">
              {
                state.features?.map((feature: any) => (
                  <div key={feature} className="group cursor-pointer">
                    <button 
                      type="button"
                      className="px-3 py-1.5 text-[13px] font-medium bg-slate-100 text-slate-600 rounded-full flex items-center gap-2 border border-slate-200 transition-all duration-200 group-hover:bg-red-100 group-hover:border-red-300 group-hover:text-red-500"
                      onClick={() => dispatch({ type: 'REMOVE_FEATURE', payload: feature })}
                    >
                      {feature}
                      <span className="bg-slate-200 text-slate-500 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200 group-hover:bg-red-500 group-hover:text-white">X</span>
                    </button>
                  </div>
                ))
              }
            </div>
            
            <label className={labelClasses}>Price</label>
            <input name='price' type="number" min='1' className={inputClasses} onChange={handleFormCange} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Add