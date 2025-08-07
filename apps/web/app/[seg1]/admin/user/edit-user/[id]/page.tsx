"use client";
import { useEffect, useState, use } from "react";
import { api_get_user } from "@/app/src/constants";
import { toast } from "sonner";

export default function EditUser(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [item, setItem] = useState<UserTypes | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<UserTypes>({
    id: params.id, // Initialize with the id from params
    name: "",
    country: "",
    state: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const url = await api_get_user({
          id: params.id,
          remark: "admin 1",
        });

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "x-api-key": "",
            "x-api-secret": "",
          },
        });

        const response = await res.json();
        setItem(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching items:", error);
        setLoading(false);
      }
    };

    fetchItems();
  }, [params.id]);

  useEffect(() => {
    if (item) {
      setFormData({
        id: params.id, // Ensure the id is included
        name: item.name || "",
        country: item.country || "",
        address: item.address || "",
        state: item.state || "",
        city: item.city || "",
        phone: item.phone || "",
        email: item.email || "",
        password: item.password || "",
      });
    }
  }, [item, params.id]);

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
      const url = "";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
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
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form");
    }
  };

  return (
    <>
      {loading ? (
        <div>loading</div>
      ) : (
        <div className="w-full max-w-5xl">
          <h1 className="text-2xl font-bold mb-4">EDIT USER</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="name">Full Name:</label>
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
              <label htmlFor="country">Country:</label>
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
              <label htmlFor="phone">Phone Number:</label>
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
              <label htmlFor="email">Email:</label>
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
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
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
