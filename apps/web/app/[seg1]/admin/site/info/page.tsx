"use client";
import { useEffect, useState } from "react";
import { api_update_info } from "@/app/src/constants";
import { toast } from "sonner";

export default function EditUser() {
  const [id, setId] = useState("");
  const [item, setItem] = useState<InfoTypes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<InfoTypes>({
    id: id, // Initialize with the id from params
    name: "",
    country: "",
    state: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    footer_code: "",
    header_code: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        id: id, // Ensure the id is included
        name: item.name || "",
        country: item.country || "",
        address: item.address || "",
        state: item.state || "",
        city: item.city || "",
        phone: item.phone || "",
        email: item.email || "",
        logo: item.logo || "",
        footer_code: item.footer_code || "",
        header_code: item.header_code || "",
      });
    }
  }, [item, id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const url = await api_update_info({});
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.error(`${response.statusText}`);
        toast.error("Error while updating user");
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("user updated");
      } else {
        toast.error("Error updating user");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the form");
    }
  };

  return (
    <>
      {loading ? (
        <div>loading</div>
      ) : (
        <div className="w-full max-w-5xl">
          <h1 className="text-2xl font-bold mb-4">SITE INFO</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="name">Site Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="country">Country of Operation:</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="address">Address:</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="state">State:</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="city">City:</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="phone">Support Phone Number:</label>
              <input
                type="number"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="email">Support Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="logo">Logo Link:</label>
              <input
                type="url"
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                required
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="header_code">Header Script:</label>
              <textarea
                id="header_code"
                name="header_code"
                value={formData.header_code}
                onChange={handleInputChange}
                placeholder="<script>...</script>"
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="footer_code">Footer Script:</label>
              <textarea
                id="footer_code"
                name="footer_code"
                value={formData.footer_code}
                onChange={handleInputChange}
                placeholder="<script>...</script>"
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </>
  );
}
