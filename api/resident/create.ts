import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/resident/store";

type CreatePostBody = {
  id_card_number: number;
  name: string;
  id_card_photo: any | null;
  status: string;
  phone: number;
  is_married: boolean;
};

export const createResident = async (data: CreatePostBody) => {
  return await axios.post(`${baseUrl}${endpoint}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      "ngrok-skip-browser-warning": "true",
    },
  });
};
