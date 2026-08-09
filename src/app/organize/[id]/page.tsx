// @ts-nocheck
"use client";

import toast from 'react-hot-toast';
import { useEffect, useReducer, useState } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from "next/navigation";
import { packageReducer, initialState } from '@/reducers/packageReducer';
import { axiosFetch, generateImageURL } from '@/utils';
import { Loader, CustomSelect } from '@/components';

import { useUserStore } from "@/store/userStore";
import '../Add.scss';

const EditPackage = () => {
  const { id } = useParams();
  const user = useUserStore((state: any) => state.user);
  const [state, dispatch] = useReducer(packageReducer, initialState);
  const [coverImage, setCoverImage] = useState(null);
  const [packageImages, setPackageImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const navigate = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => axiosFetch.get('/admin/categories').then(({ data }) => data)
  });

  const categoryList = Array.isArray(fetchedCategories) ? fetchedCategories : fetchedCategories.categories || [];

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
              ...data,
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

  const handleFormFeature = (event: any) => {
    event.preventDefault();
    if (event.target[0].value.trim() === '') return;
    dispatch({
      type: 'ADD_FEATURE',
      payload: event.target[0].value
    });
    event.target.reset();
  };

  const handleImageUploads = async () => {
    try {
      setUploading(true);
      let newCover = state.cover;
      let newImages = state.images || [];

      if (coverImage) {
        const coverRes = await generateImageURL(coverImage);
        newCover = coverRes.url;
      }
      
      if (packageImages.length > 0) {
        const imagesRes = await Promise.all(
          [...packageImages].map(async (img) => await generateImageURL(img))
        );
        newImages = imagesRes.map((img) => img.url);
      }

      dispatch({
        type: 'ADD_IMAGES',
        payload: { cover: newCover, images: newImages }
      });
      setUploading(false);
      setDisabled(true);
      toast.success('Images uploaded successfully!');
    }
    catch (error) {
      console.log(error);
      toast.error('Image upload failed');
      setUploading(false);
    }
  };

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    
    // Validate required fields
    const requiredKeys = ['title', 'category', 'description', 'shortTitle', 'shortDesc', 'deliveryTime', 'revisionNumber', 'price'];
    for(let key of requiredKeys) {
      if(state[key] === '' || state[key] === undefined || state[key] === null) {
        toast.error('Please fill input field: ' + key);
        return;
      }
    }

    const form = { ...state };
    toast.success("Updating pkg...");
    
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

  return (
    <div className='add'>
      <div className="container">
        <h1>Edit Package: {packageData.title}</h1>
        <div className="sections">
          <div className="left">
            <label htmlFor="title">Title</label>
            <input 
              name='title' 
              type="text" 
              placeholder="e.g. I will do something I'm really good at" 
              value={state.title} 
              onChange={handleFormChange} 
            />

            <label htmlFor="category">Category</label>
            <CustomSelect
              options={categoryList.map((item: any) => ({
                value: item.slug || item.name || item._id || String(item),
                label: item.name || (item.slug ? item.slug[0].toUpperCase() + item.slug.slice(1) : String(item))
              }))}
              value={state.category}
              onChange={(value) => handleFormChange({ target: { name: 'category', value } })}
              placeholder="Select Category"
            />

            <div className="images">
              <div className="imagesInputs">
                <label htmlFor="">Cover Image (Leave empty to keep current)</label>
                <input type="file" accept='image/*' onChange={(event: any) => setCoverImage(event.target.files[0])} />
                {state.cover && !coverImage && <img src={state.cover} alt="Current Cover" style={{width: 80, height: 50, objectFit: 'cover', marginTop: 10, borderRadius: 4}} />}
                <br />
                <label htmlFor="">Upload Images (Leave empty to keep current)</label>
                <input type="file" accept='image/*' multiple onChange={(event: any) => setPackageImages(event.target.files)} />
                {state.images && state.images.length > 0 && packageImages.length === 0 && (
                  <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                    {state.images.map((img, i) => (
                      <img key={i} src={img} alt="Current" style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 4}} />
                    ))}
                  </div>
                )}
              </div>
              <button disabled={!!disabled} onClick={handleImageUploads}>{uploading ? 'Uploading...' : disabled ? 'Uploaded' : 'Update Images'}</button>
            </div>

            <label htmlFor="description">Description</label>
            <textarea 
              name='description' 
              cols={30} 
              rows={16} 
              placeholder='Brief descriptions to introduce your service to customers' 
              value={state.description} 
              onChange={handleFormChange}
            ></textarea>
            
            <button onClick={handleFormSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Updating...' : 'Update Package'}
            </button>
          </div>

          <div className="right">
            <label htmlFor="shortTitle">Service Title</label>
            <input 
              type="text" 
              name='shortTitle' 
              placeholder='e.g. One-page web design' 
              value={state.shortTitle} 
              onChange={handleFormChange} 
            />

            <label htmlFor="shortDesc">Short Description</label>
            <textarea 
              name='shortDesc' 
              cols={30} 
              rows={10} 
              placeholder='Short description of your service' 
              value={state.shortDesc} 
              onChange={handleFormChange}
            ></textarea>

            <label htmlFor="deliveryTime">Delivery Time (e.g. 3 days)</label>
            <input 
              type="number" 
              name='deliveryTime' 
              min='1' 
              value={state.deliveryTime} 
              onChange={handleFormChange} 
            />

            <label htmlFor="revisionNumber">Revision Number</label>
            <input 
              type="number" 
              name='revisionNumber' 
              min='1' 
              value={state.revisionNumber} 
              onChange={handleFormChange} 
            />

            <label htmlFor="">Add Feature</label>
            <form className='add' onSubmit={handleFormFeature}>
              <input type="text" placeholder='e.g. page design' />
              <button type='submit'>Add</button>
            </form>
            <div className="addedFeatures">
              {
                state.features?.map((feature: any) => (
                  <div key={feature} className="item">
                    <button type="button" onClick={() => dispatch({ type: 'REMOVE_FEATURE', payload: feature })}>{feature}
                      <span>X</span>
                    </button>
                  </div>
                ))
              }
            </div>
            <label htmlFor="price">Price</label>
            <input 
              name='price' 
              type="number" 
              min='1' 
              value={state.price} 
              onChange={handleFormChange} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPackage;
