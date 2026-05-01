import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/manage-bill/update";

type UpdatePostBody = {
  status: string;
};

export const chageStatusBill = async (id: number, data: UpdatePostBody) => {
  return await axios.put(`${baseUrl}${endpoint}/${id}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
