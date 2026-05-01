import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/report/total-money";

export const getTotalMoney = async (bill_id?: number | null) => {
  return await axios.get(`${baseUrl}${endpoint}`, {
    params: {
      ...(bill_id && { bill_id }),
    },
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};
