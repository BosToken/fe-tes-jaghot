import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const endpoint = "api/house/update/residence";

type UpdateResidentBody = {
  resident_id: number;
};

export const updateResidentHouse = async (id: number, data: UpdateResidentBody) => {
  return await axios.put(`${baseUrl}${endpoint}/${id}`, data, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
};