import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/resident/delete";

export const deleteResident = async (id: number) => {
  console.log("BASE URL:", baseUrl);
  return await axios.delete(`${baseUrl}${endpoint}/${id}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
