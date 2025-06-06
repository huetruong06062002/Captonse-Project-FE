import axios from "axios";
import { axiosClientVer2 } from "../config/axiosInterceptor";

// [GET]
const getRequest = async (url) => {
  const res = await axiosClientVer2.get(`${url}`);
  return res;
};

// [GET] -> params
const getRequestParams = async (url, params) => {
  const res = await axiosClientVer2.get(`${url}`, { params: params });
  return res;
};

// [POST] -> params
const postRequestParams = async (url, params) => {
  const res = await axiosClientVer2.post(`${url}`, { params: params });
  return res;
};

// [POST]
const postRequest = async (url, payload) => {
  const res = await axiosClientVer2.post(`${url}`, payload);
  return res;
};

// [DELETE]
const deleteRequest = async (url) => {
  const res = await axiosClientVer2.delete(`${url}`);
  return res;
};

// [DELETE] -> params
const deleteRequestParams = async (url, params) => {
  const queryParams = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryParams}`;
  const res = await axiosClientVer2.delete(fullUrl);
  return res;
};

const deleteRequestParamsV2 = async (url, params) => {

  const fullUrl = `${url}/${params}`;
  const res = await axiosClientVer2.delete(fullUrl);
  return res;
};

// [PUT]
const putRequest = async (url, payload) => {
  const res = await axiosClientVer2.put(`${url}`, payload, {
    headers: {
      "Content-Type": "application/json", // Ensure content type is JSON
    },
  });
  return res;
};

//[PUT] -> params
const putRequestParams = async (url, params) => {
  const queryParams = new URLSearchParams(params).toString();
  const res = await axiosClientVer2.put(`${url}?${queryParams}`);
  return res;
};

// [PATCH]
const patchRequest = async (url, payload) => {
  const res = await axiosClientVer2.patch(`${url}`, payload);
  return res;
};

const serializeParams = (params) => {
  return new URLSearchParams(params).toString();
};

// [POST] -> multipart/form-data with URL parameters
// const postRequestMultipartFormData = async (url, params, filePayload) => {
//   try {
//     const formData = new FormData();
//     formData.append("FileUpload", filePayload.FileUpload);

//     const queryParams = serializeParams(params);
//     const fullUrl = `${url}?${queryParams}`;

//     const res = await axiosClientVer2.post(fullUrl, formData, {
//       headers: {
//         Accept: "application/json, text/plain, */*",
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     return res.data;
//   } catch (error) {
//     console.error("Error in postRequestMultipartFormData:", error);
//     throw error;
//   }
// };
// [POST] -> multipart/form-data with URL parameters
const postRequestMultipartFormData = async (url, formData, params = {}) => {
  try {
    const queryParams = serializeParams(params);
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;

    const res = await axiosClientVer2.post(fullUrl, formData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data", // This is crucial for sending form data
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error in postRequestMultipartFormData:", error);
    throw error;
  }
};

// [PUT] -> multipart/form-data with URL parameters
const putRequestMultipartFormData = async (url, formData, params = {}, filePayload = null) => {
  try {
    // Create a new FormData object if it's not passed
    const data = new FormData();

    // Append the file to the formData if filePayload is provided and contains FileUpload
    if (filePayload && filePayload.FileUpload) {
      data.append("FileUpload", filePayload.FileUpload);
    }

    // Append other form data if necessary
    for (const [key, value] of Object.entries(formData)) {
      data.append(key, value);
    }

    // Serialize query parameters
    const queryParams = new URLSearchParams(params).toString();
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;

    console.log("fullUrl:", fullUrl);
    console.log("formData:", data);

    const res = await axiosClientVer2.put(fullUrl, formData, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
      },
    });



    return res.data;
  } catch (error) {
    console.error("Error in putRequestMultipartFormData:", error);
    throw error;
  }
};



export {
  getRequest,
  getRequestParams,
  postRequest,
  postRequestMultipartFormData,
  deleteRequest,
  deleteRequestParams,
  deleteRequestParamsV2,
  putRequest,
  putRequestParams,
  putRequestMultipartFormData,
  patchRequest,
  postRequestParams,
};
