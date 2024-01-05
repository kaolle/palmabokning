import axios from "axios";
import {getApiUrl} from "./utils";

export async function loginRequest(credentials: Credentials) {
    try {
        return await axios.post(getApiUrl()+'auth/signin', credentials);
        // Continue with other synchronous operations
    } catch (error) {
        throw error;
        // Handle errors or throw an exception
    }
}

export async function signupRequest(credentials: Credentials) {
    try {
        return await axios.post(getApiUrl()+'auth/signup', credentials);
        // Continue with other synchronous operations
    } catch (error) {
        throw error;
        // Handle errors or throw an exception
    }
}
