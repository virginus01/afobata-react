"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const url = "";

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "x-api-key": "",
            "x-api-secret": "",
          },
        });

        const response = await res.json();

        if (response.success) {
          setItems(response.data);
        } else {
          toast.error("error loading users");
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleEdit = (id: any) => {
    router.push(`/${id}`);
  };

  const handleDelete = (index: any) => {
    const newItemList = items.filter((_, i) => i !== index);
    setItems(newItemList);
  };

  return (
    <div className="mx-auto p-4 space-y-4 font-mono text-sm">
      <ul className="space-y-4">
        {items ? (
          items.map((item: any, index) => (
            <li
              key={index}
              className="p-4 border rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-900 transition-all flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-bold text-lg mb-2">
                  Name: {item?.name ?? "N/A"}
                </div>
                <div className="text-gray-700">
                  Name: {item?.name ?? "Unknown"}
                </div>
              </div>
              <div className="mt-2 md:mt-0 md:ml-4 flex space-x-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                  onClick={() => handleEdit(item?.id)}
                >
                  Edit
                </button>
              </div>
            </li>
          ))
        ) : (
          <>No users</>
        )}
      </ul>
    </div>
  );
}
