import { ApiError, request, type RequestOptions } from "@/lib/api-client";
import { getAccessToken, refreshSession } from "./session";

/** For endpoints behind the API's JwtAuthGuard **/
export async function authedRequest<T> (
    path: string,
    options: Omit<RequestOptions, "accessToken"> = {}
): Promise<T> {
    const token = getAccessToken() ?? (await refreshSession())
    if(!token) throw new ApiError(401, "Not signed in") 

    try {
        return await request<T>(path, {...options, accessToken: token });
    } catch(err) {
        if(!(err instanceof ApiError) || err.status !== 401) throw err;

        const current = getAccessToken();
        const fresh = current && current !== token ? current : await refreshSession()
        if (!fresh) throw err;
        return request<T>(path, {...options, accessToken: fresh})
    }
}

