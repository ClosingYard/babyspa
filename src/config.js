const useSecondaryServer = process.env.REACT_APP_USE_SECONDARY_SERVER === 'true'; // You can toggle this in your .env file

const config = {
    baseURL: useSecondaryServer 
        ? (process.env.REACT_APP_SECONDARY_API_URL || 'https://spa-six-rho.vercel.app/api') // Secondary server URL
        : (process.env.REACT_APP_API_URL || 'http://192.168.178.86:5000/api'), // Primary server URL
};

export default config;