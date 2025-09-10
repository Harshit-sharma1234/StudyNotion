import axios from "axios";

// Create a reusable axios instance (can set baseURL here if needed)
export const axiosInstance = axios.create({
  // baseURL: "https://your-api-url.com", // Optional base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiConnector = (method, url, bodyData = {}, headers = {}, params = {}) => {
  return axiosInstance({
    method,
    url,
    data: bodyData,
    headers: {
      ...axiosInstance.defaults.headers.common, // include default headers
      ...headers, // merge custom headers like Authorization
    },
    params,
  });
};
