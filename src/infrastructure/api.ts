import axios, {AxiosInstance} from 'axios';
import axiosRetry from 'axios-retry';
import {Constants} from "../constants/constants.js";

export function getApiInstance(baseUrl:  string, accessToken: string): AxiosInstance {
    const api = axios.create({
        baseURL: baseUrl,
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`

        },
        validateStatus: (status) => status < Constants.INTERNAL_SERVER_ERROR
    });

    axiosRetry(api, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) => {
            return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                (error.response != null && error.response?.status >= Constants.INTERNAL_SERVER_ERROR);
        }
    });

    return api;
}