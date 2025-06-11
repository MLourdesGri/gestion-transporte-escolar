import axios from "axios";

const API_URL = "https://gestion-transporte-escolar-be-production-e770.up.railway.app"; 

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

interface RouteResponse {
  success: boolean;
  data: {
    locations: { lat: number; lng: number; address: string }[];
    routeSummary: {
      totalDuration: number;
      totalDurationText: string;
      legs: {
        from: string;
        to: string;
        duration: number;
        durationText: string;
        steps: {
          distance: { text: string; value: number };
          duration: { text: string; value: number };
          end_location: { lat: number; lng: number };
          start_location: { lat: number; lng: number };
          html_instructions: string;
          travel_mode: string;
          maneuver?: string;
        }[];
      }[];
    };
  };
  error: string | null;
}

export const geocodeAddresses = async (tripId: number, token: string) => {
  try {
    const response = await api.get<RouteResponse>(`/maps/geocode-trip/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error geocodificando direcciones:", error);
    return null;
  }
}