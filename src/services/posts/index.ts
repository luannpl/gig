import api from "../api";

export async function getPosts() {
  try {
    const response = await api.get("/posts");
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createPost(formData: FormData) {
  try {
    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data, // Importante: não transformar o FormData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}