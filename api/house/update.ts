import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/house/update";

type UpdatePostBody = {
  number_house: string;
  address: string;
};

export const updateHouse = async (id: number, data: UpdatePostBody) => {
  return await axios.put(`${baseUrl}${endpoint}/${id}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};