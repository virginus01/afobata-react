import { api_get_product } from "@/app/src/constants";

export async function getProductData(id: string, subBase: string) {
  let url = await api_get_product({ id, subBase });

  const res = await fetch(url, {
    method: "GET",
    // headers: baseHeaders,
  });

  const response = await res.json();

  return response;
}
