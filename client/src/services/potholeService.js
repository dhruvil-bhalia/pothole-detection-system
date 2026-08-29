import axios from "axios";

const API_URL = "https://pothole-detection-system-6usv.onrender.com/api/potholes";

// -----------------------------
// JWT Token
// -----------------------------
const getAuthHeader = () => {

  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

};

// -----------------------------
// GET ALL POTHOLES
// -----------------------------
export const getAllPotholes = async () => {

  const response =
    await axios.get(API_URL);

  return response.data;

};

// -----------------------------
// ADD POTHOLE
// -----------------------------
export const addPothole = async (potholeData) => {

  const response =
    await axios.post(
      `${API_URL}/add`,
      potholeData,
      getAuthHeader()
    );

  return response.data;

};

// -----------------------------
// UPDATE POTHOLE
// -----------------------------
export const updatePothole = async (
  id,
  potholeData
) => {

  const response =
    await axios.put(
      `${API_URL}/${id}`,
      potholeData,
      getAuthHeader()
    );

  return response.data;

};

// -----------------------------
// DELETE POTHOLE
// -----------------------------
export const deletePothole = async (
  id
) => {

  const response =
    await axios.delete(
      `${API_URL}/${id}`,
      getAuthHeader()
    );

  return response.data;

};

// -----------------------------
// IMAGE UPLOAD
// -----------------------------
export const uploadImage = async (
  formData
) => {

  const token =
    localStorage.getItem("token");

  const response =
    await axios.post(
      `${API_URL}/upload`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  return response.data;

};