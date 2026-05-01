import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/expense/store";

type CreatePostBody = {
  bill_id: number;
  amount: number;
  description: string;
};

export const createExpense = async (data: CreatePostBody) => {
  return await axios.post(`${baseUrl}${endpoint}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
