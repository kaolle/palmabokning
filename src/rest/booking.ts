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

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            [JWT_TOKEN, TOKEN_TYPE, 'familyMemberId', 'jwtExpirationTimestamp', 'userRole'].forEach(
                key => localStorage.removeItem(key)
            );
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

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

export async function createFamilyMemberRequest(name: string, phrase: string) {
    try {
        return await axiosInstance.post(`${FAMILY_MEMBER_PATH}`, { name, phrase });
    } catch (error) {
        throw error;
    }
}

export async function updateFamilyMemberRequest(uuid: string, name: string, phrase: string) {
    try {
        return await axiosInstance.put(`${FAMILY_MEMBER_PATH}/${uuid}`, { name, phrase });
    } catch (error) {
        throw error;
    }
}

export async function deleteFamilyMemberRequest(uuid: string) {
    try {
        return await axiosInstance.delete(`${FAMILY_MEMBER_PATH}/${uuid}`);
    } catch (error) {
        throw error;
    }
}

export async function getMyFamilyMemberRequest() {
    return await axiosInstance.get(`${FAMILY_MEMBER_PATH}/me`);
}

const GUESTBOOK_PATH = 'guestbook';

export async function getGuestbookEntriesRequest() {
    return await axiosInstance.get(GUESTBOOK_PATH);
}

export async function postGuestbookEntryRequest(stayFrom: string, stayTo: string, message: string) {
    return await axiosInstance.post(GUESTBOOK_PATH, { stayFrom, stayTo, message });
}

export async function deleteGuestbookEntryRequest(id: string) {
    return await axiosInstance.delete(`${GUESTBOOK_PATH}/${id}`);
}
