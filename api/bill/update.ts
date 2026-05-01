import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/bill/update";

type UpdatePostBody = {
  title: string;
  cost: number;
};

export const updateBill = async (id: number, data: UpdatePostBody) => {
  return await axios.put(`${baseUrl}${endpoint}/${id}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};