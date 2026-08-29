import axios from "axios";

const API =
  "https://pothole-detection-system-6usv.onrender.com/api/auth";

export const login = async (loginData) => {

  const response =
    await axios.post(
      `${API}/login`,
      loginData
    );

  return response.data;

};