import axios from "axios";

const API_URL = "http://localhost:3000"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface Response {
  success: boolean;
  data: { url: string };
  error: string | null;
}

interface SignatureResponse {
  signature: string;
  timestamp: string;
  api_key: string;
}

export const getSignature = async (): Promise<SignatureResponse> => {
  try {
    const response = await api.post<SignatureResponse>("/files/signature");
  return response.data;
  } catch (error) {
    console.error("Error al obtener la firma:", error);
    throw new Error("Error al obtener la firma");
  }
}

export const uploadFile = async (file: File): Promise<Response> => {
  const { signature, timestamp, api_key } = await getSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  try {
    const response = await api.post<Response>("/files/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
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

export const geocodeAddresses = async () => {
  try {
    const response = await api.get<Response>("/maps/geocode-trip");

    return response.data;
  } catch (error) {
    console.error("Error geocodificando direcciones:", error);
    return null;
  }
}