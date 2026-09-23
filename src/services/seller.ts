import { SellerProfile } from "@/interfaces/interface";
import api from "@/utils/api";

export const getSellerProfile = async () => {

    const response = await api.get(`sellers/`);
    return response;
};

export const updateSellerProfile = async (profileData: SellerProfile) => {
    // Note: If Django throws a "Method Not Allowed" on POST, switch api.post to api.patch below
    const response = await api.put(`sellers/`, profileData);
    return response
};