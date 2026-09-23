import { SearchResponse } from "@/interfaces/interface";
import api from "@/utils/api";


/**
 * Sends a search term query directly to the Django Algolia backend endpoint
 */
export const searchProducts = async (query: string) => {
    // Calling the POST endpoint we configured in the Django APIdiv
    const response = await api.post<SearchResponse>(`search/`, {
      query: query,
    });
    return response;
};