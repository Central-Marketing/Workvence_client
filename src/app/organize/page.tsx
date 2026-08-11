// @ts-nocheck
"use client";

import toast from 'react-hot-toast';
import { useEffect, useReducer, useState } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { X, FileText, Upload } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import { packageReducer, initialState } from '@/reducers/packageReducer';
import { axiosFetch, generateImageURL } from '@/utils';
import adminAxios from '@/utils/adminAxios';
import supportService from '@/utils/supportService';

import { useUserStore } from "@/store/userStore";
import { CustomSelect } from '@/components';

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

const Add = () => {
  const user = useUserStore((state: any) => state.user);
  const [state, dispatch] = useReducer(packageReducer, initialState);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [packageImages, setPackageImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [activeTier, setActiveTier] = useState('basic');
  const navigate = useRouter();
  const queryClient = useQueryClient();

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminAxios.get('/categories').then(({ data }) => data)
  });

  const categoryList = Array.isArray(fetchedCategories)
    ? fetchedCategories
    : Array.isArray(fetchedCategories?.data)
      ? fetchedCategories.data
      : fetchedCategories?.categories || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mutation = useMutation({
    mutationFn: async (pkg: any) => {
      const { data } = await axiosFetch.post('/gigs', pkg);
      return data;
    },
    onSuccess: () => {
      toast.success("Congratulations! Package created successfully!");
      queryClient.invalidateQueries({ queryKey: ['my-packages'] });
      setTimeout(() => {
        navigate.push('/my-packages');
      }, 1500);
    },
    onError: (error: any) => {
      console.error('Create package failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to create package');
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
    if (activeTier === 'basic') {
      dispatch({
        type: 'CHANGE_INPUT',
        payload: { name, value }
      });
      // Also sync basic tier title if editing shortTitle or title
      if (name === 'shortTitle' || name === 'title') {
        dispatch({
          type: 'CHANGE_PACKAGE_INPUT',
          payload: { tier: 'basic', name: 'title', value }
        });
        dispatch({
          type: 'CHANGE_PACKAGE_INPUT',
          payload: { tier: 'basic', name: 'shortTitle', value }
        });
      }
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

  // Select local attachment files
  const handleFilesSelected = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      setPackageImages((prev) => [...prev, ...newFiles]);
      setDisabled(false);
    }
  };

  // Remove a local file before upload
  const handleRemoveLocalFile = (indexToRemove: number) => {
    setPackageImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Remove an uploaded CDN image URL
  const handleRemoveCdnImage = (urlToRemove: string) => {
    dispatch({
      type: 'ADD_IMAGES',
      payload: {
        cover: state.cover,
        images: (state.images || []).filter((img: string) => img !== urlToRemove)
      }
    });
  };

  // Remove cover image
  const handleRemoveCover = () => {
    setCoverImage(null);
    dispatch({
      type: 'ADD_IMAGES',
      payload: {
        cover: '',
        images: state.images || []
      }
    });
  };

  // Upload image/attachment to CDN (Cloudinary) with fallback to ImgBB
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
      toast.error('Please select a cover image or package images first');
      return;
    }
    try {
      setUploading(true);
      const cover = coverImage ? await uploadToCDN(coverImage) : { url: state.cover || '' };
      const newUploaded = await Promise.all(
        packageImages.map(async (img) => await uploadToCDN(img))
      );
      const newUrls = newUploaded.map((img) => img.url).filter(Boolean);
      const combinedImages = [...(state.images || []), ...newUrls];

      dispatch({
        type: 'ADD_IMAGES',
        payload: {
          cover: cover.url || state.cover || '',
          images: combinedImages
        }
      });
      setPackageImages([]);
      setUploading(false);
      setDisabled(true);
      toast.success('Attachments uploaded to CDN successfully!');
    }
    catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Failed uploading attachments to CDN');
    }
  };

  const handleFormSubmit = (event: any) => {
    if (event) event.preventDefault();
    const form = { ...state, userID: user?._id || user?.id };

    // Ensure basic package fields are synced
    if (form.packages?.basic) {
      const bTitle = form.packages.basic.title || form.packages.basic.shortTitle || form.shortTitle || form.title || '';
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
      toast.error('Please fill all Basic package details (Title, Short Description, Delivery Time, and Price)');
      return;
    }

    mutation.mutate(form);
  };

  const inputClasses = "p-3.5 border border-slate-200 rounded-lg text-slate-800 bg-slate-50 transition-all duration-300 w-full placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:bg-white focus:ring-4 focus:ring-brand-green/10";
  const labelClasses = "text-slate-700 text-sm font-semibold -mb-2";
  const btnClasses = "px-6 py-4 rounded-lg bg-brand-green font-semibold text-base text-white transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:bg-[#059669] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,185,129,0.3)] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

  const activePackage = state.packages?.[activeTier];

  return (
    <div className='min-h-screen bg-slate-50 py-10 flex justify-center font-sans'>
      <div className="w-[95%] md:w-[90%] max-w-[1100px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-8 md:py-12 md:px-16 mx-auto">
        <h1 className="text-slate-900 font-bold text-2xl md:text-3xl mb-10 border-b-2 border-slate-100 pb-5">Add New Package</h1>

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
              placeholder="Category"
            />

            {/* Media & Attachment Section */}
            <div className="flex flex-col gap-5 p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              {/* 1. Cover Image Upload & Remove */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 text-sm font-semibold">Cover Image</label>
                <input
                  type="file"
                  accept='image/*,.pdf,.zip'
                  className="p-2.5 bg-white border border-slate-200 rounded-md cursor-pointer text-sm text-slate-600"
                  onChange={(event: any) => {
                    if (event.target.files?.[0]) {
                      setCoverImage(event.target.files[0]);
                      setDisabled(false);
                    }
                  }}
                />

                {(coverImage || state.cover) && (
                  <div className="relative group w-24 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-xs mt-2 bg-slate-100">
                    <img
                      src={coverImage ? URL.createObjectURL(coverImage) : state.cover}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                      onClick={handleRemoveCover}
                      title="Remove Cover Image"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[9px] text-center font-bold py-0.5">
                      COVER
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Attachments / Gallery Images Upload & Remove */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-slate-700 text-sm font-semibold">
                  Upload Attachments / Images (CDN)
                </label>
                <input
                  type="file"
                  accept='image/*,.pdf,.zip,.doc,.docx'
                  multiple
                  className="p-2.5 bg-white border border-slate-200 rounded-md cursor-pointer text-sm text-slate-600"
                  onChange={handleFilesSelected}
                />

                {((state.images && state.images.length > 0) || packageImages.length > 0) && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {/* CDN Uploaded Images */}
                    {state.images?.map((url: string, index: number) => (
                      <div key={`cdn-${index}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs">
                        {url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes('cloudinary') || url.includes('ibb.co') ? (
                          <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-1 text-slate-500">
                            <FileText size={20} />
                            <span className="text-[9px] font-semibold uppercase mt-1 truncate max-w-full px-1">File</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                          onClick={() => handleRemoveCdnImage(url)}
                          title="Remove Attachment"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}

                    {/* Newly Selected Local Files */}
                    {packageImages.map((file: File, index: number) => (
                      <div key={`local-${index}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-brand-green/40 bg-white shadow-xs">
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-1 text-slate-600">
                            <FileText size={20} />
                            <span className="text-[9px] font-semibold truncate max-w-full px-1">{file.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                          onClick={() => handleRemoveLocalFile(index)}
                          title="Remove File"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                        <span className="absolute bottom-0 inset-x-0 bg-brand-green text-white text-[8px] text-center font-bold py-0.5">
                          NEW
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className={`${btnClasses} mt-2 px-6 py-2.5 text-sm w-auto self-start`}
                disabled={!!disabled || uploading || (!coverImage && packageImages.length === 0)}
                onClick={handleImageUploads}
              >
                {uploading ? 'Uploading to CDN...' : disabled ? 'Uploaded to CDN' : 'Upload Attachments to CDN'}
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

            <button
              type="button"
              className={`${btnClasses} mt-4 flex items-center justify-center gap-2`}
              onClick={handleFormSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating Package...
                </>
              ) : (
                'Create Package'
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-2">
              {['basic', 'standard', 'premium'].map((tier) => (
                <button
                  key={tier}
                  type="button"
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
                <button type="button" className={`${btnClasses} px-6 py-2 text-sm h-auto`} onClick={() => toggleTier(activeTier)}>
                  Enable {activeTier.charAt(0).toUpperCase() + activeTier.slice(1)} Package
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center -mb-2">
                  <label className={labelClasses}>Service Title ({activeTier})</label>
                  {activeTier !== 'basic' && (
                    <button type="button" className="text-xs text-red-500 hover:text-red-700 font-medium" onClick={() => toggleTier(activeTier)}>
                      Disable
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  name={activeTier === 'basic' ? 'shortTitle' : 'title'}
                  className={inputClasses}
                  placeholder='e.g. One-page web design'
                  onChange={handlePackageFormChange}
                  value={activeTier === 'basic' ? (activePackage.shortTitle || activePackage.title || '') : (activePackage.title || '')}
                />

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
  )
}

export default Add;