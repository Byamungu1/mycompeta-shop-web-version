import { useCallback, useRef, useState } from 'react';

// Interface for useFetch return object
interface FetchResult<T> {
    data: T | null;
    loading: boolean;
    error: any;
    refetch: (arg: any) => Promise<boolean>;
}

// Interface for usePost execution response
interface PostResponse<T> {
    success: boolean;
    data?: T;
    error?: any;
}

interface PostResult<TResponse, TBody> {
    execute: (body: TBody) => Promise<PostResponse<TResponse>>;
    data: TResponse | null;
    loading: boolean;
    error: any;
}

/**
 * useFetch Hook (Typed)
 * @template T The expected shape of the returned data array or object
 */
export const useFetch = <T>(fetchFunc: (arg: string | null) => any): FetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const fetchFuncRef = useRef(fetchFunc);
    fetchFuncRef.current = fetchFunc;

    // The actual fetch logic — no setArg here at all
    const runFetch = useCallback(async (arg: string | null): Promise<boolean> => {
        setLoading(true);
        setError(null);

        console.log('🔄 [useFetch] Starting fetch with arg:', arg)
        console.log('🔄 [useFetch] Current data before fetch:', data)

        try {
            const response = await fetchFuncRef.current(arg);
            console.log('🔄 [useFetch] API response received:', response.data)
            setData(response.data as T);
            console.log('🔄 [useFetch] Data set successfully')
            return true;
        } catch (err: any) {
            setError(err.response?.data || err.message || 'Something went wrong');
            console.error('❌ [useFetch] Fetch failed:', err)
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (newArg: any | null): Promise<boolean> => {
        return await runFetch(newArg);
    }, [runFetch]);

    return { data, loading, error, refetch };
};

/**
 * usePost Hook (Typed)
 * @template TResponse The expected shape of the backend server response
 * @template TBody The shape of the JSON payload being sent to the backend
 */
export const usePost = <TResponse = any, TBody = any>(
    postFunc: (body: TBody) => any
): PostResult<TResponse, TBody> => {
    const [data, setData] = useState<TResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const execute = useCallback(async (body: TBody): Promise<PostResponse<TResponse>> => {
        console.log('🎯 usePost execute called with body:', JSON.stringify(body, null, 2));
        setLoading(true);
        setError(null);
        try {
            console.log('📞 Calling postFunc...');
            const responseData = await postFunc(body);
            console.log('📞 postFunc returned:', responseData);

            setData(responseData.data as TResponse);

            // Determine if the API response actually represents an error
            const apiError = responseData.error || null;
            const isSuccess = responseData.status == 201 || responseData.status == 200 ||
            responseData.data !== null;

            console.log('the data from create order', isSuccess)

            console.log('📊 Processing response - apiError:', apiError, 'isSuccess:', isSuccess);

            if (apiError) {
                setError(apiError);
            }

            // Return 'error' explicitly in the returned object!
            return {
                success: isSuccess,
                data: responseData.data as TResponse,
                error: apiError
            };
        } catch (err: any) {
            const errorData = err?.response?.data || err.message || 'Submission failed';
            console.error('❌ Error in usePost execute:', errorData);
            console.error('❌ Full error object:', err);
            setError(errorData);
            return { success: false, error: errorData };
        } finally {
            setLoading(false);
        }
    }, [postFunc]);

    return { execute, data, loading, error };
};

interface UpdateResponse<TResponse> {
    success: boolean;
    data?: TResponse;
    error?: any;
}

interface UpdateResult<TResponse, TBody, TId> {
    execute: (id: TId, body: TBody) => Promise<UpdateResponse<TResponse>>;
    data: TResponse | null;
    loading: boolean;
    error: any;
}

export const useUpdate = <TResponse = any, TBody = any, TId = string>(
    updateFunc: (id: TId, body: TBody) => any
): UpdateResult<TResponse, TBody, TId> => {
    const [data, setData] = useState<TResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const execute = useCallback(async (id: TId, body: TBody): Promise<UpdateResponse<TResponse>> => {
        setLoading(true);
        setError(null);
        try {
            // Invokes the API handler passing both arguments down the chain
            const responseData = await updateFunc(id, body);
            setData(responseData.data as TResponse);

            const status: boolean = responseData.data !== false ? true : false;
            console.log('the result from the update api', responseData.data);

            return { success: status, data: responseData.data as TResponse };
        } catch (err: any) {
            const errorData = err?.response?.data || err.message || 'Update failed';
            console.log('the errors in the user update api', errorData);
            setError(errorData);
            return { success: false, error: errorData };
        } finally {
            setLoading(false);
        }
    }, [updateFunc]);

    return { execute, data, loading, error };
};


interface DeleteResponse<TResponse> {
    success: boolean;
    data?: TResponse;
    error?: any;
}

interface DeleteResult<TResponse, TId> {
    execute: (id: TId) => Promise<DeleteResponse<TResponse>>;
    data: TResponse | null;
    loading: boolean;
    error: any;
}

export const useDelete = <TResponse = any, TId = string>(
    deleteFunc: (id: TId) => any
): DeleteResult<TResponse, TId> => {
    const [data, setData] = useState<TResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const execute = useCallback(async (id: TId): Promise<DeleteResponse<TResponse>> => {
        setLoading(true);
        setError(null);

        // ⚙️ Debug Log: Hook initialization parameters
        console.log('🗑️ [Hook: useDelete] Deletion process initiated for ID:', id);

        try {
            const responseData = await deleteFunc(id);
            setData(responseData?.data as TResponse);

            const status: boolean = responseData !== false ? true : false;

            // ✅ Debug Log: Successful backend resolution
            console.log('✅ [Hook: useDelete] Server response data:', responseData?.data);

            return { success: status, data: responseData?.data as TResponse };
        } catch (err: any) {
            // ❌ Debug Log: Detailed network failure block
            console.log('❌ [Hook: useDelete] Deletion request failed:', {
                status: err?.response?.status,
                serverMessage: err?.response?.data,
                localMessage: err.message
            });

            const errorData = err?.response?.data?.message || err.message || 'Deletion failed';
            setError(errorData);
            return { success: false, error: errorData };
        } finally {
            setLoading(false);
        }
    }, [deleteFunc]);

    return { execute, data, loading, error };
};