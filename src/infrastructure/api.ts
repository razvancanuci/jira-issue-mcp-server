import axios, {AxiosInstance} from 'axios';
import axiosRetry from 'axios-retry';
import {StatusCodes} from "../constants/statusCodes.js";

export function getApiInstance(baseUrl:  string): AxiosInstance {
    const api = axios.create({
        baseURL: baseUrl,
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json',
        },
        validateStatus: (status) => status < StatusCodes.INTERNAL_SERVER_ERROR
    });

    axiosRetry(api, {
        retries: 3,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) => {
            return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                (error.response != null && error.response?.status >= StatusCodes.INTERNAL_SERVER_ERROR);
        }
    });

    return api;
}