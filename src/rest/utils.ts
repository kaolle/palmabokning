import config from "../config";

export const getApiUrl = () => {
    // Determine the environment (development or production)
    const environment = process.env.NODE_ENV || 'development';

    // Use the appropriate URI based on the environment
    // @ts-ignore
    return config[environment].apiUrl;
};
