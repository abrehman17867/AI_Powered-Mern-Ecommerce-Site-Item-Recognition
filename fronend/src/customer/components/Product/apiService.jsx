import { apiWithMultipart } from "../../../config/apiConfig";

export const searchProductsByImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await apiWithMultipart.post(
      "/api/products/search-by-image/upload",
      formData
    );
    const data = response.data;
    if (Array.isArray(data)) {
      return { products: data, predictedLabel: null };
    }
    return {
      products: Array.isArray(data?.products) ? data.products : [],
      predictedLabel: data?.predictedLabel ?? null,
      matchMethod: data?.matchMethod ?? null,
      searchKeywords: data?.searchKeywords ?? [],
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
