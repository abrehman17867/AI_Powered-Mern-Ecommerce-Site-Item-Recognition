import { apiWithMultipart } from "../../../config/apiConfig";

export const searchProductsByImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await apiWithMultipart.post("/api/products/search-by-image/upload", formData);
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
