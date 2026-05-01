import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/manage-bill/update";

type UpdatePostBody = {
  period_start_at: string;
  period_end_at: string;
  house_id: number;
  resident_id: number;
  bill_id: number;
};

export const updateManageBill = async (id: number, data: UpdatePostBody) => {
  return await axios.put(`${baseUrl}${endpoint}/${id}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
