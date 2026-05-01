import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/resident";

export const getResidents = async (page = 1) => {
  return await axios.get(`${baseUrl}${endpoint}?page=${page}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};