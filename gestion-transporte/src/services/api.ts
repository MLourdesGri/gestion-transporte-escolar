import axios from "axios";

const API_URL = "http://localhost:3000"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;  // Devuelve solo los usuarios dentro de 'data'
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
};


export default api;
