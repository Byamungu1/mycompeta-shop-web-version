import { BuyerProfileSettings } from "@/interfaces/interface";
import api from "@/utils/api";


export const updatateBuyerProfile = async(id='', formData: BuyerProfileSettings)=>{
    const response = api.patch('buyer/profile/settings/', formData);
    return response
}