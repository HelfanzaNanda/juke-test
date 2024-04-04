
export class ApiClient {
    static readonly METHOD_POST = "POST";
    static readonly METHOD_GET = "GET";
    static readonly METHOD_PUT = "PUT";
    static readonly METHOD_PATCH = "PATCH";
    static readonly METHOD_DELETE = "DELETE";
    static readonly METHOD_OPTIONS = "OPTIONS";

    private static apiUrl: string | null | undefined = null;
    private static apiKey: string | null | undefined = null;

    // constructor() {
    // }
    
    private static async init(path: string, acceptJson: boolean = false) {
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.escuelajs.co/api/v1';

        const headers: { [key: string]: any } = {
            "Accept": "application/json",
        }
        if (acceptJson) {
            headers["Content-Type"] = "application/json";
        }
        const fullpath = `${apiUrl}/${path}`;

        return { fullpath, headers };
    }

    private static async originalRequest(path: string, config: RequestInit, acceptJson: boolean = true) {
        const { fullpath, headers } = await ApiClient.init(path, acceptJson);
        config.headers = headers;
        const resp = await fetch(fullpath, config);
        const response = await resp.json();
        return { resp, response };
    }



    private static async refreshToken() {
        const params = { 
            // email 
        };
        const config: RequestInit = {
            method: ApiClient.METHOD_POST,
            body: JSON.stringify(params),
        }
        const { resp } = await ApiClient.originalRequest('refresh-token', config);
    }


    static async request<T>(path: string, method: string = ApiClient.METHOD_GET, params?: any): Promise<any> {
        const config: RequestInit = {
            method: method,
        };
        if (![ApiClient.METHOD_GET, ApiClient.METHOD_DELETE].includes(method)) {
            config.body = JSON.stringify(params);
        }
        const { response, resp } = await ApiClient.originalRequest(path, config);
        return { response, status : resp.status };
    };

    static async requestFile<T>(path: string, method: string = ApiClient.METHOD_GET, params?: any): Promise<any> {
        const config: RequestInit = {
            method: method,
            headers : {
                responseType: "blob",
            }
        };
        if (![ApiClient.METHOD_GET, ApiClient.METHOD_DELETE].includes(method)) {
            config.body = params;
        }
        const { response, resp } = await ApiClient.originalRequest(path, config, false);
        return response;
    };

    static async downloadFile(path: string, filename: string) : Promise<File> {
        const config: RequestInit = {
            method: this.METHOD_GET,
        };

        const { fullpath, headers } = await ApiClient.init(path, false);
        headers['Accept'] = "application/octet-stream";
        config.headers = headers;
        const resp = await fetch(fullpath, config);
        const blob = await resp.blob();
        const file = new File([blob], filename, { type: blob.type });
        return file;
    };

    static async fetcher(path: string) {
        const config = {
            method: ApiClient.METHOD_GET,
        };
        


        const { response, resp } = await ApiClient.originalRequest(path, config);
        console.log('response : ', response);
        console.log('resp : ', resp);
        
        return response;
    };
}