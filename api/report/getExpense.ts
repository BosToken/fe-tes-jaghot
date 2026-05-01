import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/report/expense-by-date";

export const getExpenses = async (
  start_date?: string | null,
  end_date?: string | null,
  bill_id?: number | null
) => {
  return await axios.get(`${baseUrl}${endpoint}`, {
    params: {
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(bill_id && { bill_id }),
    },
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};