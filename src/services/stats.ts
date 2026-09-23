import api from "@/utils/api";
import { Alert } from "@/components/common/ui";


export const fetchDashboardData = async () => {

    try {
        const response = await api.get('seller/dashboard/')
        return response
    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        Alert.alert("Network Error", "Check your internet connection and try again.");
    }
}