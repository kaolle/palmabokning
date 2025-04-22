import axios from "axios";
import {getApiUrl} from "./utils";
import {JWT_TOKEN, TOKEN_TYPE} from "../authentication/AuthContext";


// Create an Axios instance with default configuration
const axiosInstance = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const jwtToken = localStorage.getItem(JWT_TOKEN);
    const tokenType = localStorage.getItem(TOKEN_TYPE);
    config.headers.Authorization = `${tokenType} ${jwtToken}`;
    return config;
});

const BOOKING_PATH = 'booking';
const FAMILY_MEMBER_PATH = 'family-member';

export async function postBookingRequest(from: Date, to: Date) {
    from.setHours(6); // adjust so we store correct date
    to.setHours(6);
    try {
        let requestBody: BookingRequest;
        requestBody = {
            from,
            to,
        };
        await axiosInstance.post(BOOKING_PATH, requestBody);
        // Continue with other synchronous operations
    } catch (error) {
        throw error;
        // Handle errors or throw an exception
    }
}

export async function postBookingForMemberRequest(from: Date, to: Date, familyMemberId: string) {
    from.setHours(6); // adjust so we store correct date
    to.setHours(6);
    try {
        let requestBody: BookingForMemberRequest;
        requestBody = {
            from,
            to
        };
        await axiosInstance.post(`${BOOKING_PATH}/family-member/${familyMemberId}`, requestBody);
        // Continue with other synchronous operations
    } catch (error) {
        throw error;
        // Handle errors or throw an exception
    }
}
export async function deleteBookingRequest(booking: Booking|null) {

    try {
        await axiosInstance.delete(`${BOOKING_PATH}/${booking?.id}`);
        // Continue with other synchronous operations
    } catch (error) {
        throw error;
        // Handle errors or throw an exception
    }
}

export async function getBookingsRequest() {
    return await axiosInstance.get(BOOKING_PATH);
}

export async function getFamilyMembersRequest() {
    return await axiosInstance.get(`${FAMILY_MEMBER_PATH}`);
}
