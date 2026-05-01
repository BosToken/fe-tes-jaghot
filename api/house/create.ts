import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/house/store";

type CreatePostBody = {
  number_house: string;
  address: string;
};

export const createHouse = async (data: CreatePostBody) => {
  return await axios.post(`${baseUrl}${endpoint}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
