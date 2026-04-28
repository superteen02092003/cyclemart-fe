import api from '@/services/api';

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/v1/cloudinary/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
