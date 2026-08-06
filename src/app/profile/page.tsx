"use client";

import toast from 'react-hot-toast';
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { axiosFetch } from "@/utils";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import "./Profile.scss";

const Profile = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Form states
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "");
  const [description, setDescription] = useState(user?.description || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user?.image || "/media/noavatar.png");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let imageUrl = user?.image;

      // Upload image to imgbb if a new file is chosen
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await fetch("https://api.imgbb.com/1/upload?key=6857715a54c637cd1d21c558202e7c9c", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.data.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const { data } = await axiosFetch.patch("/users", {
        image: imageUrl,
        phone,
        country,
        description,
      });

      if (!data.error) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="profile">
      <div className="container">
        <div className="card profile-card">
          <div className="card-header">
            <h1>Edit Profile Settings</h1>
            <p>Update your personal information, description, or profile picture</p>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="avatar-section">
              <img src={previewUrl} className="avatar-preview" alt="avatar preview" />
              <div className="file-input-wrapper">
                <button type="button" className="upload-btn">Choose Image</button>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
              <p className="file-hint">JPEG, PNG formats accepted</p>
            </div>

            <hr />

            <div className="form-fields">
              <div className="field-group">
                <label>Account Username</label>
                <input type="text" value={user?.username || ""} disabled className="disabled-input" />
                <span className="input-hint">Username cannot be changed</span>
              </div>

              <div className="field-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ""} disabled className="disabled-input" />
                <span className="input-hint">Contact support to request email updates</span>
              </div>

              <div className="field-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. +1 555-0199" 
                  value={phone} 
                  onChange={(e: any) => setPhone(e.target.value)} 
                />
              </div>

              <div className="field-group">
                <label>Country</label>
                <input 
                  type="text" 
                  placeholder="e.g. United States" 
                  value={country} 
                  onChange={(e: any) => setCountry(e.target.value)} 
                />
              </div>

              <div className="field-group full-width">
                <label>Bio / Professional Description</label>
                <textarea 
                  placeholder="Tell clients about your background, skills, or expertise..."
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            <div className="form-footer">
              <button type="submit" className="save-btn" disabled={isUpdating}>
                {isUpdating ? "Saving Settings..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  return (
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  );
}
