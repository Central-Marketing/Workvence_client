"use client";

import toast from 'react-hot-toast';
import { useEffect, useReducer, useState } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { X, FileText, Upload, ChevronDown, Plus } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import { packageReducer, initialState } from '@/reducers/packageReducer';
import { axiosFetch, generateImageURL } from '@/utils';
import useAdminCategories from '@/hooks/useAdminCategories';
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
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [packageImages, setPackageImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [activeTier, setActiveTier] = useState('basic');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [showAddFeature, setShowAddFeature] = useState(false);
  const navigate = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { categoryList, parentCategories, getSubcategories, getNiches } = useAdminCategories();

  // Fetch the existing package details
  const { isLoading, error, data: packageData } = useQuery({
    queryKey: ['package', id],
    queryFn: () =>
      axiosFetch.get(`/gigs/${id}`)
        .then(({ data }) => {
          return data?.data || data?.gig || data;
        })
        .catch(({ response }) => {
          toast.error(response?.data?.message || 'Failed to fetch package details');
          navigate.push('/my-packages');
        }),
    enabled: !!id,
  });

  // Sync state whenever packageData loads or updates from cache/network
  useEffect(() => {
    if (!packageData) return;
    const raw = packageData?.data || packageData?.gig || packageData;
    const gigTitle = raw.title || raw.shortTitle || raw.name || '';
    const existingPackages = raw.packages || {};
    const basicPkg = existingPackages.basic || {
      title: gigTitle,
      shortDesc: raw.shortDesc || '',
      price: raw.price || 0,
      deliveryTime: raw.deliveryTime || '',
      revisionNumber: raw.revisionNumber || '',
      features: raw.features || []
    };
    if (!basicPkg.title) {
      basicPkg.title = gigTitle || raw.shortTitle || '';
    }

    const rawCover = raw.cover || raw.coverImage || raw.cover_image || '';
    let rawImages: string[] = [];
    if (Array.isArray(raw.images)) {
      rawImages = raw.images;
    } else if (typeof raw.images === 'string' && raw.images.trim()) {
      try {
        const parsed = JSON.parse(raw.images);
        rawImages = Array.isArray(parsed) ? parsed : [raw.images];
      } catch {
        rawImages = [raw.images];
      }
    } else if (Array.isArray(raw.packageImages)) {
      rawImages = raw.packageImages;
    }

    dispatch({
      type: 'INITIALIZE_STATE',
      payload: {
        ...initialState,
        ...raw,
        title: gigTitle,
        category: raw.category || '',
        categoryId: raw.categoryId || '',
        subcategory: raw.subcategory || '',
        subcategoryId: raw.subcategoryId || '',
        niche: raw.niche || '',
        nicheId: raw.nicheId || '',
        cover: rawCover,
        images: rawImages,
        faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
        packages: {
          ...existingPackages,
          basic: basicPkg,
          standard: existingPackages.standard || null,
          premium: existingPackages.premium || null
        },
        features: Array.isArray(raw.features) ? raw.features : [],
      }
    });
  }, [packageData]);

  // Backward-compatibility: if existing package had a child category stored as category, resolve its parent & subcategory
  useEffect(() => {
    if (!categoryList || categoryList.length === 0 || !state.category) return;
    const matchedChild = categoryList.find(
      (c: any) =>
        c.parentId &&
        (c.slug === state.category || c.name === state.category || c._id === state.category || c.id === state.category)
    );
    if (matchedChild && !state.subcategory) {
      const parent = parentCategories.find(
        (p: any) => p._id === matchedChild.parentId || p.id === matchedChild.parentId
      );
      if (parent) {
        dispatch({
          type: 'CHANGE_INPUT',
          payload: { name: 'category', value: parent.name || parent.slug }
        });
        dispatch({
          type: 'CHANGE_INPUT',
          payload: { name: 'subcategory', value: matchedChild.name || matchedChild.slug }
        });
        dispatch({
          type: 'CHANGE_INPUT',
          payload: { name: 'subcategoryId', value: matchedChild._id || matchedChild.id }
        });
        dispatch({
          type: 'CHANGE_INPUT',
          payload: { name: 'categoryId', value: matchedChild._id || matchedChild.id }
        });
      }
    }
  }, [categoryList, parentCategories, state.category, state.subcategory]);

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
    if (name === 'title') {
      dispatch({
        type: 'CHANGE_PACKAGE_INPUT',
        payload: { tier: 'basic', name: 'title', value }
      });
      dispatch({
        type: 'CHANGE_PACKAGE_INPUT',
        payload: { tier: 'basic', name: 'shortTitle', value }
      });
    }
  };

  const currentSubcategories = getSubcategories(state.category || packageData?.category);
  const currentNiches = getNiches(state.subcategory || packageData?.subcategory);

  // Dedicated handler for parent category selection (resets subcategory & niche)
  const handleCategorySelect = (val: string | number) => {
    const stringVal = String(val);
    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === stringVal ||
        p.name === stringVal ||
        p.name?.toLowerCase() === stringVal.toLowerCase() ||
        p.slug?.toLowerCase() === stringVal.toLowerCase()
    );
    const parentId = selectedParent?._id || selectedParent?.id || '';
    const parentName = selectedParent?.name || stringVal;

    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'category', value: parentName }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'categoryId', value: parentId }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'subcategory', value: '' }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'subcategoryId', value: '' }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'niche', value: '' }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'nicheId', value: '' }
    });
  };

  // Dedicated handler for subcategory selection (resets niche)
  const handleSubcategorySelect = (val: string | number) => {
    const stringVal = String(val);
    const subs = getSubcategories(state.category || packageData?.category);
    const selectedSub = subs.find(
      (s: any) =>
        (s.slug || s._id || s.id) === stringVal ||
        s.name === stringVal ||
        s.name?.toLowerCase() === stringVal.toLowerCase() ||
        s.slug?.toLowerCase() === stringVal.toLowerCase()
    );
    const subId = selectedSub?._id || selectedSub?.id || '';
    const subName = selectedSub?.name || stringVal;

    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'subcategory', value: subName }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'subcategoryId', value: subId }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'niche', value: '' }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'nicheId', value: '' }
    });

    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === state.category ||
        p.name === state.category ||
        p.name?.toLowerCase() === String(state.category).toLowerCase()
    );
    const finalId = subId || selectedParent?._id || selectedParent?.id || '';
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'categoryId', value: finalId }
    });
  };

  // Dedicated handler for niche selection (2nd child)
  const handleNicheSelect = (val: string | number) => {
    const stringVal = String(val);
    const niches = getNiches(state.subcategory || packageData?.subcategory);
    const selectedNiche = niches.find(
      (n: any) =>
        (n.slug || n._id || n.id) === stringVal ||
        n.name === stringVal ||
        n.name?.toLowerCase() === stringVal.toLowerCase() ||
        n.slug?.toLowerCase() === stringVal.toLowerCase()
    );
    const nicheId = selectedNiche?._id || selectedNiche?.id || '';
    const nicheName = selectedNiche?.name || stringVal;

    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'niche', value: nicheName }
    });
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'nicheId', value: nicheId }
    });

    const subs = getSubcategories(state.category || packageData?.category);
    const selectedSub = subs.find(
      (s: any) =>
        (s.slug || s._id || s.id) === state.subcategory ||
        s.name === state.subcategory ||
        s.name?.toLowerCase() === String(state.subcategory).toLowerCase()
    );
    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === state.category ||
        p.name === state.category ||
        p.name?.toLowerCase() === String(state.category).toLowerCase()
    );
    const finalId = nicheId || selectedSub?._id || selectedSub?.id || selectedParent?._id || selectedParent?.id || '';
    dispatch({
      type: 'CHANGE_INPUT',
      payload: { name: 'categoryId', value: finalId }
    });
  };

  const handleTierInputChange = (name: string, value: any) => {
    if (name === 'price') {
      if (value !== '' && Number(value) <= 0) {
        toast.error('Price must be a positive number greater than $0', { id: 'price-error' });
        return;
      }
    }
    dispatch({
      type: 'CHANGE_PACKAGE_INPUT',
      payload: { tier: activeTier, name, value }
    });
    if (activeTier === 'basic') {
      dispatch({
        type: 'CHANGE_INPUT',
        payload: { name, value }
      });
      if (name === 'shortTitle' || name === 'title') {
        dispatch({
          type: 'CHANGE_INPUT',
          payload: { name: 'title', value }
        });
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

  const handlePackageFormChange = (event: any) => {
    const { name, value } = event.target;
    handleTierInputChange(name, value);
  };

  const handleAddFeature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFeatureInput.trim()) return;
    dispatch({
      type: 'ADD_PACKAGE_FEATURE',
      payload: { tier: activeTier, feature: newFeatureInput.trim() }
    });
    if (activeTier === 'basic') {
      dispatch({
        type: 'ADD_FEATURE',
        payload: newFeatureInput.trim()
      });
    }
    setNewFeatureInput('');
    setShowAddFeature(false);
  };

  const handleRemoveFeature = (feature: string) => {
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
    handleRemoveFeature(feature);
  };

  const handleAddFaq = (e: any) => {
    if (e) e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error('Please enter both Question and Answer for FAQ');
      return;
    }
    dispatch({
      type: 'ADD_FAQ',
      payload: { question: faqQuestion.trim(), answer: faqAnswer.trim() }
    });
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleRemoveFaq = (index: number) => {
    dispatch({
      type: 'REMOVE_FAQ',
      payload: index
    });
  };

  const toggleTier = (tier: string) => {
    dispatch({
      type: 'TOGGLE_PACKAGE_TIER',
      payload: { tier }
    });
  };

  const activeCover = coverImage
    ? URL.createObjectURL(coverImage)
    : (!coverRemoved ? (state.cover || packageData?.cover || packageData?.coverImage || '') : '');

  const activeImages: string[] =
    (state.images && state.images.length > 0)
      ? state.images
      : (Array.isArray(packageData?.images)
          ? packageData.images
          : (typeof packageData?.images === 'string' && packageData.images ? [packageData.images] : []));

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
  const handleRemoveCdnImage = async (urlToRemove: string) => {
    if (urlToRemove && (urlToRemove.includes('cloudinary.com') || urlToRemove.includes('/upload/'))) {
      try {
        toast.loading('Deleting asset ...', { id: 'delete-asset' });
        await supportService.deleteCloudinaryFile(urlToRemove);
        toast.success('Asset deleted ', { id: 'delete-asset' });
      } catch (err) {
        console.warn('Failed to delete asset:', err);
        toast.dismiss('delete-asset');
      }
    }
    const filteredImages = activeImages.filter((img: string) => img !== urlToRemove);
    dispatch({
      type: 'ADD_IMAGES',
      payload: {
        cover: activeCover,
        images: filteredImages
      }
    });
  };

  // Remove cover image
  const handleRemoveCover = async () => {
    const currentCoverUrl = activeCover;
    setCoverImage(null);
    setCoverRemoved(true);
    dispatch({
      type: 'ADD_IMAGES',
      payload: {
        cover: '',
        images: activeImages
      }
    });
    if (currentCoverUrl && (currentCoverUrl.includes('cloudinary.com') || currentCoverUrl.includes('/upload/'))) {
      try {
        toast.loading('Deleting cover image ...', { id: 'delete-cover' });
        await supportService.deleteCloudinaryFile(currentCoverUrl);
        toast.success('Cover image deleted ', { id: 'delete-cover' });
      } catch (err) {
        console.warn('Failed to delete cover image:', err);
        toast.dismiss('delete-cover');
      }
    }
  };

  const uploadToCDN = async (file: File) => {
    if (!file) return { url: '' };
    try {
      const uploaded = await supportService.uploadFileToCloudinary(file, 'gig_attachments');
      if (uploaded?.secure_url || uploaded?.url) {
        return { url: uploaded.secure_url || uploaded.url };
      }
    } catch (err) {
      console.warn(' upload failed, trying fallback:', err);
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

      const oldCoverUrl = activeCover;
      let newCoverUrl = activeCover || '';

      if (coverImage) {
        if (oldCoverUrl && (oldCoverUrl.includes('cloudinary.com') || oldCoverUrl.includes('/upload/'))) {
          try {
            await supportService.deleteCloudinaryFile(oldCoverUrl);
          } catch (err) {
            console.warn('Failed deleting old cover image:', err);
          }
        }
        const uploadedCover = await uploadToCDN(coverImage);
        newCoverUrl = uploadedCover.url || '';
        setCoverImage(null);
        setCoverRemoved(false);
      }

      const newUploaded = await Promise.all(
        packageImages.map(async (img) => await uploadToCDN(img))
      );
      const newUrls = newUploaded.map((img) => img.url).filter(Boolean);
      const combinedImages = [...activeImages, ...newUrls];

      dispatch({
        type: 'ADD_IMAGES',
        payload: {
          cover: newCoverUrl,
          images: combinedImages
        }
      });
      setPackageImages([]);
      setUploading(false);
      setDisabled(true);
      toast.success('Attachments updated and old cover replaced!');
    }
    catch (error) {
      console.error(error);
      toast.error('Attachment upload failed');
      setUploading(false);
    }
  };

  const handleFormSubmit = (event: any) => {
    if (event) event.preventDefault();

    // Resolve hierarchical category, subcategory, and niche information
    const selectedParent = parentCategories.find(
      (p: any) =>
        (p.slug || p._id || p.id) === state.category ||
        p.name === state.category ||
        p.name?.toLowerCase() === String(state.category).toLowerCase()
    );
    const currentSubs = getSubcategories(state.category || packageData?.category);
    const selectedSub = currentSubs.find(
      (s: any) =>
        (s.slug || s._id || s.id) === state.subcategory ||
        s.name === state.subcategory ||
        s.name?.toLowerCase() === String(state.subcategory).toLowerCase()
    );
    const currentNiches = getNiches(state.subcategory || packageData?.subcategory);
    const selectedNiche = currentNiches.find(
      (n: any) =>
        (n.slug || n._id || n.id) === state.niche ||
        n.name === state.niche ||
        n.name?.toLowerCase() === String(state.niche).toLowerCase()
    );

    // Deepest chosen category ID is sent as categoryId (UUID): niche > subcategory > parent
    const resolvedCategoryId =
      selectedNiche?._id ||
      selectedNiche?.id ||
      selectedSub?._id ||
      selectedSub?.id ||
      selectedParent?._id ||
      selectedParent?.id ||
      state.categoryId ||
      undefined;

    const resolvedCategoryName = selectedParent?.name || state.category;
    const resolvedSubcategoryName = selectedSub?.name || state.subcategory || undefined;

    const {
      subcategoryId: _unusedSubId,
      niche: _unusedNiche,
      nicheId: _unusedNicheId,
      ...cleanState
    } = (state as any);

    const finalCover = coverRemoved
      ? ''
      : (state.cover || packageData?.cover || packageData?.coverImage || '');
    const finalImages = (state.images && state.images.length > 0)
      ? state.images
      : (Array.isArray(packageData?.images) ? packageData.images : []);

    const form = {
      ...cleanState,
      cover: finalCover,
      images: finalImages,
      categoryId: resolvedCategoryId,
      category: resolvedCategoryName,
      subcategory: resolvedSubcategoryName,
      faqs: state.faqs || []
    };
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

    // Validate that prices for all enabled package tiers are positive (> 0)
    const tiers = ['basic', 'standard', 'premium'];
    for (const tier of tiers) {
      const pkg = form.packages?.[tier];
      if (pkg) {
        const pkgPrice = Number(pkg.price);
        if (isNaN(pkgPrice) || pkgPrice <= 0) {
          toast.error(`Price for ${tier.charAt(0).toUpperCase() + tier.slice(1)} package must be a positive number greater than $0`);
          return;
        }
      }
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

  const inputClasses = "p-3.5 border border-[#EDEDED] rounded-xl text-slate-800 bg-[#EDEDED]/50 transition-all duration-300 w-full placeholder:text-slate-400 focus:outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10";
  const labelClasses = "text-slate-700 text-sm font-semibold -mb-2";
  const btnClasses = "px-6 py-3.5 rounded-xl bg-black font-semibold text-sm sm:text-base text-white transition-all duration-300 shadow-sm hover:bg-gray-900 hover:-translate-y-0.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

  const activePackage = (state.packages as any)?.[activeTier];

  const tierLabels: Record<string, string> = {
    basic: "Basic",
    standard: "Silver",
    premium: "Platinum",
  };

  return (
    <div className='min-h-screen bg-slate-50 py-10 flex justify-center font-sans'>
      <div className="container bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] p-8 md:py-12 md:px-16 mx-auto">
        <h1 className="text-slate-900 font-bold text-2xl md:text-3xl mb-10 border-b-2 border-slate-100 pb-5">Edit Package: {state.title || packageData?.title || ''}</h1>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12">
          <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
            <label className={labelClasses}>Package Title</label>
            <input name='title' type="text" className={inputClasses} placeholder="e.g. I will do something I'm really good at" onChange={handleFormChange} value={state.title || (state.packages as any)?.basic?.title || packageData?.title || ''} />

            {/* Category, Subcategory & Niche Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClasses}>
                  Category <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={parentCategories.map((item: any) => ({
                    value: item.name || item.slug || item._id || String(item),
                    label: item.name || (item.slug ? item.slug[0].toUpperCase() + item.slug.slice(1) : String(item))
                  }))}
                  value={state.category || packageData?.category || ''}
                  onChange={handleCategorySelect}
                  placeholder="Select Category"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className={labelClasses}>Subcategory</label>
                  <span className="text-xs text-slate-400 font-normal">Optional</span>
                </div>
                <CustomSelect
                  options={currentSubcategories.map((sub: any) => ({
                    value: sub.name || sub.slug || sub._id || String(sub),
                    label: sub.name || sub.slug
                  }))}
                  value={state.subcategory || packageData?.subcategory || ''}
                  onChange={handleSubcategorySelect}
                  disabled={!(state.category || packageData?.category) || currentSubcategories.length === 0}
                  placeholder={
                    !(state.category || packageData?.category)
                      ? "Select category first"
                      : currentSubcategories.length === 0
                        ? "No subcategories"
                        : "Select Subcategory"
                  }
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <label className={labelClasses}>Niche</label>
                  <span className="text-xs text-slate-400 font-normal">Optional</span>
                </div>
                <CustomSelect
                  options={currentNiches.map((n: any) => ({
                    value: n.name || n.slug || n._id || String(n),
                    label: n.name || n.slug
                  }))}
                  value={state.niche || packageData?.niche || ''}
                  onChange={handleNicheSelect}
                  disabled={!(state.subcategory || packageData?.subcategory) || currentNiches.length === 0}
                  placeholder={
                    !(state.subcategory || packageData?.subcategory)
                      ? "Select subcategory first"
                      : currentNiches.length === 0
                        ? "No niches"
                        : "Select Niche"
                  }
                />
              </div>
            </div>

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
                      setCoverRemoved(false);
                      setDisabled(false);
                    }
                  }}
                />

                {Boolean(activeCover) && (
                  <div className="relative group w-24 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-xs mt-2 bg-slate-100">
                    <img
                      src={activeCover}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
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
                  Upload Attachments / Images
                </label>
                <input
                  type="file"
                  accept='image/*,.pdf,.zip,.doc,.docx'
                  multiple
                  className="p-2.5 bg-white border border-slate-200 rounded-md cursor-pointer text-sm text-slate-600"
                  onChange={handleFilesSelected}
                />

                {((activeImages && activeImages.length > 0) || packageImages.length > 0) && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {/* CDN Uploaded Images */}
                    {activeImages?.map((url: string, index: number) => {
                      const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|avif)/i) || url.includes('cloudinary') || url.includes('ibb.co') || (url.startsWith('http') && !url.match(/\.(pdf|zip|doc|docx|rar|txt)$/i));
                      return (
                        <div key={`cdn-${index}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs">
                          {isImage ? (
                            <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-1 text-slate-500">
                              <FileText size={20} />
                              <span className="text-[9px] font-semibold uppercase mt-1 truncate max-w-full px-1">File</span>
                            </div>
                          )}
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                            onClick={() => handleRemoveCdnImage(url)}
                            title="Remove Attachment"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      );
                    })}

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
                {uploading ? 'Uploading..' : disabled ? 'Uploaded' : 'Update Attachments'}
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

            {/* Frequently Asked Questions (FAQ) Section */}
            <div className="flex flex-col gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl mt-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 text-sm font-semibold">Frequently Asked Questions (FAQs)</label>
                <span className="text-xs text-slate-500 font-medium">Optional</span>
              </div>

              <div className="flex flex-col gap-3 bg-white p-4 rounded-lg border border-slate-200">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Question (e.g. Do you provide source code?)"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                />
                <textarea
                  className={`${inputClasses} min-h-[80px] resize-y`}
                  placeholder="Answer (e.g. Yes, full repository access and clean source code is included.)"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                />
                <button
                  type="button"
                  className={`${btnClasses} px-5 py-2 text-sm self-end h-auto m-0`}
                  onClick={handleAddFaq}
                >
                  Add FAQ
                </button>
              </div>

              {/* Displayed FAQs List */}
              {state.faqs && state.faqs.length > 0 && (
                <div className="space-y-3 mt-1">
                  {state.faqs.map((faq: { question: string; answer: string }, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 flex justify-between items-start gap-3 shadow-2xs">
                      <div className="space-y-1">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-800">Q: {faq.question}</h5>
                        <p className="text-xs sm:text-sm text-slate-600 font-normal">A: {faq.answer}</p>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition-colors shrink-0 cursor-pointer"
                        onClick={() => handleRemoveFaq(idx)}
                        title="Remove FAQ"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  Updating Package...
                </>
              ) : (
                'Update Package'
              )}
            </button>
          </div>

          {/* Right Column: Pricing Tier Card (Sticky & Responsive max-w-[500px]) */}
          <div className="w-full max-w-[500px] lg:w-[450px] xl:w-[480px] shrink-0 mx-auto lg:mx-0 lg:sticky lg:top-24 self-start bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.02)] p-5 sm:p-6 space-y-4">
            {/* Tier Pills Tabs: Basic, Silver (standard), Platinum (premium) */}
            <div className="bg-[#EDEDED] rounded-xl p-1 flex items-center gap-1">
              {(["basic", "standard", "premium"] as const).map((tierKey) => {
                const label = tierLabels[tierKey] || "Basic";
                const isCurrent = activeTier === tierKey;
                const isEnabled = Boolean((state.packages as any)?.[tierKey]);

                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => {
                      setActiveTier(tierKey);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isCurrent
                        ? "bg-black text-white shadow-xs"
                        : "text-gray-700 hover:text-black hover:bg-[#E0E0E0]/60"
                    }`}
                  >
                    <span>{label}</span>
                    {tierKey !== 'basic' && !isEnabled && (
                      <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${isCurrent ? "bg-white/20 text-white" : "bg-[#DBDBDB] text-gray-600"}`}>
                        Off
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activePackage === null ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-[#EDEDED]/50 rounded-xl border border-dashed border-[#C7C7C7] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#EDEDED] flex items-center justify-center text-gray-700">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {tierLabels[activeTier] || activeTier} Tier is not active
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Enable this tier to offer clients higher tier deliverables and custom pricing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTier(activeTier)}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Enable {tierLabels[activeTier] || activeTier} Package
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-1 border-b border-[#EDEDED]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900">
                      {tierLabels[activeTier]} Package Details
                    </span>
                    <span className="text-[10px] bg-black text-white font-medium px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  {activeTier !== "basic" && (
                    <button
                      type="button"
                      onClick={() => toggleTier(activeTier)}
                      className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
                    >
                      Disable Tier
                    </button>
                  )}
                </div>

                {/* Package title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Package title
                  </label>
                  <input
                    type="text"
                    name={activeTier === 'basic' ? 'shortTitle' : 'title'}
                    value={activeTier === 'basic' ? (activePackage.title || state.title || activePackage.shortTitle || '') : (activePackage.title || '')}
                    onChange={(e) => handleTierInputChange(activeTier === 'basic' ? 'shortTitle' : 'title', e.target.value)}
                    placeholder="e.g I will do something i am really good at"
                    className="w-full bg-[#EDEDED] border border-transparent focus:border-black focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-500 outline-none transition-all"
                  />
                </div>

                {/* Package description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Package description
                  </label>
                  <textarea
                    name="shortDesc"
                    value={activePackage.shortDesc || ''}
                    onChange={(e) => handleTierInputChange("shortDesc", e.target.value)}
                    placeholder="write description"
                    rows={3}
                    className="w-full bg-[#EDEDED] border border-transparent focus:border-black focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-500 outline-none transition-all resize-y min-h-[80px]"
                  />
                </div>

                {/* Add delivery time & Revisions in responsive 2-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Add delivery time */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Add delivery time
                    </label>
                    <div className="relative">
                      <select
                        name="deliveryTime"
                        value={activePackage.deliveryTime || ""}
                        onChange={(e) => handleTierInputChange("deliveryTime", e.target.value)}
                        className="w-full bg-[#EDEDED] border border-transparent focus:border-black focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none cursor-pointer appearance-none pr-8"
                      >
                        <option value="" disabled>e.g 12 days</option>
                        <option value="1">1 day</option>
                        <option value="2">2 days</option>
                        <option value="3">3 days</option>
                        <option value="5">5 days</option>
                        <option value="7">7 days</option>
                        <option value="10">10 days</option>
                        <option value="12">12 days</option>
                        <option value="14">14 days</option>
                        <option value="21">21 days</option>
                        <option value="30">30 days</option>
                        <option value="45">45 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        {activePackage.deliveryTime && !['1','2','3','5','7','10','12','14','21','30','45','60','90'].includes(String(activePackage.deliveryTime)) && (
                          <option value={activePackage.deliveryTime}>{activePackage.deliveryTime} {Number(activePackage.deliveryTime) === 1 ? 'day' : 'days'}</option>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Revisions */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Revisions
                    </label>
                    <div className="relative">
                      <select
                        name="revisionNumber"
                        value={activePackage.revisionNumber !== undefined ? String(activePackage.revisionNumber) : ""}
                        onChange={(e) => handleTierInputChange("revisionNumber", e.target.value)}
                        className="w-full bg-[#EDEDED] border border-transparent focus:border-black focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none cursor-pointer appearance-none pr-8"
                      >
                        <option value="">Select Revisions</option>
                        <option value="0">0 Revisions</option>
                        <option value="1">1 Revision</option>
                        <option value="2">2 Revisions</option>
                        <option value="3">3 Revisions</option>
                        <option value="5">5 Revisions</option>
                        <option value="10">10 Revisions</option>
                        <option value="Unlimited">Unlimited Revisions</option>
                        {activePackage.revisionNumber && !['','0','1','2','3','5','10','Unlimited'].includes(String(activePackage.revisionNumber)) && (
                          <option value={String(activePackage.revisionNumber)}>{activePackage.revisionNumber} Revisions</option>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Add Features */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Add Features
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {activePackage.features?.map((f: string) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 bg-[#EDEDED] border border-[#D5D5D5] px-2 py-0.5 rounded text-[11px] text-gray-800"
                      >
                        {f}
                        <X
                          className="w-3 h-3 text-gray-500 hover:text-red-500 cursor-pointer"
                          onClick={() => handleRemoveFeature(f)}
                        />
                      </span>
                    ))}
                  </div>

                  {showAddFeature ? (
                    <form onSubmit={handleAddFeature} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Responsive design"
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        className="bg-[#EDEDED] border border-[#D5D5D5] rounded-lg px-2.5 py-1 text-xs text-gray-800 outline-none flex-1 focus:bg-white focus:border-black"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-black hover:bg-gray-800 text-white text-xs px-3 py-1 rounded font-semibold cursor-pointer transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddFeature(false);
                          setNewFeatureInput("");
                        }}
                        className="text-gray-400 hover:text-gray-600 text-xs px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddFeature(true)}
                      className="text-black hover:text-gray-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Add Features <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Set price */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Set price ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      min="1"
                      step="any"
                      value={activePackage.price || ""}
                      onChange={(e) => handleTierInputChange("price", e.target.value)}
                      placeholder="e.g $200"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                      className="w-full bg-[#EDEDED] border border-transparent focus:border-black focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Quick Update Button inside Sticky Card */}
                <div className="pt-2 border-t border-[#EDEDED]">
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={mutation.isPending}
                    className="w-full bg-black hover:bg-gray-900 text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Updating Package...
                      </>
                    ) : (
                      "Update Package"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPackage;
