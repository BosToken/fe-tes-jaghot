import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/bill/store";

type CreatePostBody = {
  title: string;
  cost: number;
};

export const createBill = async (data: CreatePostBody) => {
  return await axios.post(`${baseUrl}${endpoint}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
