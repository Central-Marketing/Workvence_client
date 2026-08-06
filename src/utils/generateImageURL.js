import axios from "axios";

const generateImageURL = async (image) => {
  const file = new FormData();
  file.append("image", image);

  const apiKey = import.meta.env.VITE_IMGBB_KEY || "6857715a54c637cd1d21c558202e7c9c";

  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    file
  );
  return { url: response.data.data.url };
};

export default generateImageURL;
