const useSecondaryServer = process.env.REACT_APP_USE_SECONDARY_SERVER === 'true'; // You can toggle this in your .env file

const config = {
    baseURL: useSecondaryServer 
        ? (process.env.REACT_APP_SECONDARY_API_URL || 'https://2b762e5c-3059-44cc-bfed-924ba91a2a2c-00-bbyd2k6zzhco.kirk.replit.dev/api') // Secondary server URL
        : (process.env.REACT_APP_API_URL || 'http://192.168.178.86:5000/api'), // Primary server URL
};

export default config;
