import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/manage-bill/store";

type CreatePostBody = {
  period_start_at: string;
  period_end_at: string;
  house_id: number;
  resident_id: number;
  bill_id: number;
};

export const createManageBill = async (data: CreatePostBody) => {
  return await axios.post(`${baseUrl}${endpoint}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
