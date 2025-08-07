"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CustomButton } from "@/app/widgets/custom_button";

export default function Dashboard() {
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    state: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
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
        toast.error("Error creating user");
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("user created");
      } else {
        setSubmitted(false);
        toast.error("Error user item");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form");
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">CREATE USER</h1>
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
        <CustomButton
          submitting={false}
          submitted={false}
          submittingText="Submitting"
          buttonText="Submit"
        />
      </form>
    </div>
  );
}
