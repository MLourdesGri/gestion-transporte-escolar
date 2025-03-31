import axios from "axios";

const API_URL = "http://localhost:3000"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface CloudinaryResponse {
  secure_url: string;
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;

  try {
    const response = await axios.post<CloudinaryResponse>(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.secure_url;
  } catch (error) {
    console.error('Error subiendo el archivo:', error);
    throw new Error('Error al subir archivo');
  }
};

export const searchPlaces = async (query: string, type: string) => {
  try {
    const response = await api.get(`/maps/places`, {
      params: { query, type },
    });

    return response.data;
  } catch (error) {
    console.error("Error en la búsqueda de lugares:", error);
    return [];
  }
};

export const getPlaceDetails = async (place_id: string) => {
  try {
    const response = await axios.get(`/maps/place-details`, {
      params: { place_id },
    });

    return response.data;
  } catch (error) {
    console.error("Error obteniendo detalles del lugar:", error);
    return null;
  }
};