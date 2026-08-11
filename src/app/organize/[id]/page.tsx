// @ts-nocheck
"use client";

import toast from 'react-hot-toast';
import { useEffect, useReducer, useState } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from "next/navigation";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { packageReducer, initialState } from '@/reducers/packageReducer';
import { axiosFetch, generateImageURL } from '@/utils';
import adminAxios from '@/utils/adminAxios';
import supportService from '@/utils/supportService';
import { Loader, CustomSelect } from '@/components';

import { useUserStore } from "@/store/userStore";

// Dynamically import ReactQuill to ensure SSG/SSR compatibility
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-44 flex flex-col items-center justify-center space-y-2 border border-slate-200 bg-slate-50 rounded-xl">
      <span className="text-xs font-semibold text-slate-400">Loading Rich Text Editor...</span>
    </div>
  ),
});

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],

    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],



  ],
};

const quillFormats = [
  'header',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'list',
  'indent',
  'align',
  'blockquote',
  'code-block',
  'link',
];

const EditPackage = () => {
  const { id } = useParams();
  const user = useUserStore((state: any) => state.user);
  const [state, dispatch] = useReducer(packageReducer, initialState);
  const [coverImage, setCoverImage] = useState(null);
  const [packageImages, setPackageImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [activeTier, setActiveTier] = useState('basic');
  const navigate = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data)
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  // Fetch the existing package details
  const { isLoading, error, data: packageData } = useQuery({
    queryKey: ['package', id],
    queryFn: () =>
      axiosFetch.get(`/gigs/${id}`)
        .then(({ data }) => {
          // Initialize state with fetched package data
          dispatch({
            type: 'INITIALIZE_STATE',
            payload: {
              ...initialState,
              ...data,
              packages: data.packages || {
                basic: {
                  title: data.shortTitle || '',
                  shortDesc: data.shortDesc || '',
                  price: data.price || 0,
                  deliveryTime: data.deliveryTime || '',
                  revisionNumber: data.revisionNumber || '',
                  features: data.features || []
                },
                standard: null,
                premium: null
              },
              features: data.features || [],
            }
          });
          return data;
        })
        .catch(({ response }) => {
          toast.error(response?.data?.message || 'Failed to fetch package details');
          navigate.push('/my-packages');
        }),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (pkg: any) =>
      axiosFetch.patch(`/gigs/${id}`, pkg)
        .then(({ data }) => {
          return data;
        })
        .catch(({ response }) => {
          toast.error(response?.data?.message || 'Update failed');
          throw response;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-packages'] });
      queryClient.invalidateQueries({ queryKey: ['package', id] });
    }
  });

  const handleFormChange = (event: any) => {
    const { name, value } = event.target;
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name, value }
    });
  };

  const handlePackageFormChange = (event: any) => {
    const { name, value } = event.target;
    dispatch({
      type: 'CHANGE_PACKAGE_INPUT',
      payload: { tier: activeTier, name, value }
    });
    // Sync with root fields for backward compatibility when editing 'basic'
    if (activeTier === 'basic') {
      dispatch({
        type: 'CHANGE_INPUT',
        payload: { name, value }
      });
    }
  };

  const handlePackageFeatureAdd = (event: any) => {
    event.preventDefault();
    if (!event.target[0].value) return;
    dispatch({
      type: 'ADD_PACKAGE_FEATURE',
      payload: { tier: activeTier, feature: event.target[0].value }
    });
    if (activeTier === 'basic') {
      dispatch({
        type: 'ADD_FEATURE',
        payload: event.target[0].value
      });
    }
    event.target.reset();
  };

  const handlePackageFeatureRemove = (feature: string) => {
    dispatch({
      type: 'REMOVE_PACKAGE_FEATURE',
      payload: { tier: activeTier, feature }
    });
    if (activeTier === 'basic') {
      dispatch({
        type: 'REMOVE_FEATURE',
        payload: feature
      });
    }
  };

  const toggleTier = (tier: string) => {
    dispatch({
      type: 'TOGGLE_PACKAGE_TIER',
      payload: { tier }
    });
  };

  const uploadToCDN = async (file: File) => {
    if (!file) return { url: '' };
    try {
      const uploaded = await supportService.uploadFileToCloudinary(file, 'gig_attachments');
      if (uploaded?.secure_url || uploaded?.url) {
        return { url: uploaded.secure_url || uploaded.url };
      }
    } catch (err) {
      console.warn('Cloudinary CDN upload failed, trying fallback:', err);
    }
    return await generateImageURL(file);
  };

  const handleImageUploads = async () => {
    if (!coverImage && packageImages.length === 0) {
      toast.error('Please select a cover image or package images to update');
      return;
    }

    try {
      setUploading(true);
      let newCover = state.cover;
      let newImages = state.images || [];

      if (coverImage) {
        const coverRes = await uploadToCDN(coverImage);
        newCover = coverRes.url || newCover;
      }

      if (packageImages.length > 0) {
        const imagesRes = await Promise.all(
          [...packageImages].map(async (img) => await uploadToCDN(img))
        );
        newImages = imagesRes.map((img) => img.url).filter(Boolean);
      }

      dispatch({
        type: 'ADD_IMAGES',
        payload: { cover: newCover, images: newImages }
      });
      setUploading(false);
      setDisabled(true);
      toast.success('Attachments uploaded to CDN successfully!');
    }
    catch (error) {
      console.error(error);
      toast.error('Attachment upload to CDN failed');
      setUploading(false);
    }
  };

  const handleFormSubmit = (event: any) => {
    if (event) event.preventDefault();

    const form = { ...state };
    if (form.packages?.basic) {
      const bTitle = form.packages.basic.title || form.packages.basic.shortDesc || form.shortTitle || form.title || '';
      form.packages.basic.title = bTitle;
      form.packages.basic.shortDesc = form.packages.basic.shortDesc || form.shortDesc || '';
      form.packages.basic.price = Number(form.packages.basic.price || form.price || 0);
      form.packages.basic.deliveryTime = form.packages.basic.deliveryTime || form.deliveryTime || '';
    }

    // Basic root level validation
    if (!form.title || !form.category || !form.description || form.description === '<p><br></p>') {
      toast.error('Please fill all main gig details (Title, Category, and Description)');
      return;
    }

    // Basic tier validation
    const basicTitle = form.packages?.basic?.title || form.packages?.basic?.shortDesc;
    if (!basicTitle || !form.packages?.basic?.shortDesc || !form.packages?.basic?.price || !form.packages?.basic?.deliveryTime) {
      toast.error('Please fill all Basic package details (Title, Short Description, Price, and Delivery Time)');
      return;
    }

    mutation.mutate(form, {
      onSuccess: () => {
        toast.success("Package updated successfully!");
        setTimeout(() => {
          navigate.push('/my-packages');
        }, 1500);
      }
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={45} />
      </div>
    );
  }

  if (error || !packageData) {
    return null;
  }

  const inputClasses = "p-3.5 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 transition-all duration-300 w-full placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10";
  const labelClasses = "text-slate-700 text-sm font-semibold -mb-2";
  const btnClasses = "px-6 py-4 rounded-lg bg-brand-green font-semibold text-base text-white transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:bg-[#059669] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.3)] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

  const activePackage = state.packages?.[activeTier];

  return (
    <div className='min-h-screen bg-slate-50 py-10 flex justify-center font-sans'>
      <div className="w-[95%] md:w-[90%] max-w-[1100px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-8 md:py-12 md:px-16 mx-auto">
        <h1 className="text-slate-900 font-bold text-2xl md:text-3xl mb-10 border-b-2 border-slate-100 pb-5">Edit Package: {packageData.title}</h1>

        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-16">
          <div className="flex-1 flex flex-col gap-6">
            <label className={labelClasses}>Gig Title</label>
            <input name='title' type="text" className={inputClasses} placeholder="e.g. I will do something I'm really good at" onChange={handleFormChange} value={state.title || ''} />

            <label className={labelClasses}>Category</label>
            <CustomSelect
              options={categoryList.map((item: any) => ({
                value: item.slug || item.name || item._id || String(item),
                label: item.name || (item.slug ? item.slug[0].toUpperCase() + item.slug.slice(1) : String(item))
              }))}
              value={state.category || ''}
              onChange={(val) => handleFormChange({ target: { name: 'category', value: val } })}
              placeholder="Select Category"
            />

            <div className="flex flex-col gap-4 p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <div className="flex flex-col gap-4 w-full">
                <label className="text-slate-700 text-sm font-semibold">Cover Image </label>
                <input type="file" accept='image/*,.pdf,.zip' className="p-2.5 bg-white border border-slate-200 rounded-md cursor-pointer" onChange={(event: any) => setCoverImage(event.target.files[0])} />
                {state.cover && !coverImage && <img src={state.cover} alt="Current Cover" style={{ width: 80, height: 50, objectFit: 'cover', marginTop: 10, borderRadius: 4 }} />}

                <label className="text-slate-700 text-sm font-semibold mt-2">Upload Attachments / Images (CDN)</label>
                <input type="file" accept='image/*,.pdf,.zip,.doc,.docx' multiple className="p-2.5 bg-white border border-slate-200 rounded-md cursor-pointer" onChange={(event: any) => setPackageImages(event.target.files)} />
                {state.images && state.images.length > 0 && packageImages.length === 0 && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    {state.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="Current" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                    ))}
                  </div>
                )}
              </div>
              <button className={`${btnClasses} mt-2 px-6 py-2.5 text-sm w-auto self-start`} disabled={!!disabled || mutation.isPending} onClick={handleImageUploads}>
                {uploading ? 'Uploading to CDN...' : disabled ? 'Uploaded to CDN' : 'Update Attachments on CDN'}
              </button>
            </div>

            <label className={labelClasses}>Description (Rich Text Editor)</label>
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
              <ReactQuill
                theme="snow"
                value={state.description || ''}
                onChange={(html) => dispatch({ type: 'CHANGE_INPUT', payload: { name: 'description', value: html } })}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write rich descriptions to introduce your service to customers..."
              />
            </div>

            <button className={`${btnClasses} mt-4`} onClick={handleFormSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Update Package'}
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-2">
              {['basic', 'standard', 'premium'].map((tier) => (
                <button
                  key={tier}
                  className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${activeTier === tier
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  onClick={() => setActiveTier(tier)}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              ))}
            </div>

            {activePackage === null ? (
              <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500 mb-4">{activeTier.charAt(0).toUpperCase() + activeTier.slice(1)} Package is not active.</p>
                <button className={`${btnClasses} px-6 py-2 text-sm h-auto`} onClick={() => toggleTier(activeTier)}>
                  Enable {activeTier.charAt(0).toUpperCase() + activeTier.slice(1)} Package
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center -mb-2">
                  <label className={labelClasses}>Service Title ({activeTier})</label>
                  {activeTier !== 'basic' && (
                    <button className="text-xs text-red-500 hover:text-red-700 font-medium" onClick={() => toggleTier(activeTier)}>
                      Disable
                    </button>
                  )}
                </div>
                <input type="text" name={activeTier === 'basic' ? 'shortTitle' : 'title'} className={inputClasses} placeholder='e.g. One-page web design' onChange={handlePackageFormChange} value={activeTier === 'basic' ? (activePackage.shortTitle || '') : (activePackage.title || '')} />

                <label className={labelClasses}>Short Description</label>
                <textarea name='shortDesc' className={`${inputClasses} min-h-[120px] resize-y`} placeholder='Short description of your service' onChange={handlePackageFormChange} value={activePackage.shortDesc || ''}></textarea>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-6">
                    <label className={labelClasses}>Delivery Time (Days)</label>
                    <input type="number" name='deliveryTime' min='1' className={inputClasses} onChange={handlePackageFormChange} value={activePackage.deliveryTime || ''} />
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                    <label className={labelClasses}>Revision Number</label>
                    <input type="number" name='revisionNumber' min='1' className={inputClasses} onChange={handlePackageFormChange} value={activePackage.revisionNumber || ''} />
                  </div>
                </div>

                <label className={labelClasses}>Add Feature</label>
                <form className='flex justify-between items-center gap-3' onSubmit={handlePackageFeatureAdd}>
                  <input type="text" className={`${inputClasses} flex-1`} placeholder='e.g. page design' />
                  <button type='submit' className={`${btnClasses} px-6 py-3.5 h-auto m-0 whitespace-nowrap`}>Add</button>
                </form>

                <div className="flex flex-wrap gap-2.5 mt-1">
                  {
                    activePackage.features?.map((feature: any) => (
                      <div key={feature} className="group cursor-pointer">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-[13px] font-medium bg-slate-100 text-slate-600 rounded-full flex items-center gap-2 border border-slate-200 transition-all duration-200 group-hover:bg-red-100 group-hover:border-red-300 group-hover:text-red-500"
                          onClick={() => handlePackageFeatureRemove(feature)}
                        >
                          {feature}
                          <span className="bg-slate-200 text-slate-500 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-200 group-hover:bg-red-500 group-hover:text-white">X</span>
                        </button>
                      </div>
                    ))
                  }
                </div>

                <label className={labelClasses}>Price ($)</label>
                <input name='price' type="number" min='1' className={inputClasses} onChange={handlePackageFormChange} value={activePackage.price || ''} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPackage;

