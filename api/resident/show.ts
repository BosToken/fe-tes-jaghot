import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/resident";

export const getResidentDetail = async (id: number) => {
  return await axios.get(`${baseUrl}${endpoint}/${id}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
