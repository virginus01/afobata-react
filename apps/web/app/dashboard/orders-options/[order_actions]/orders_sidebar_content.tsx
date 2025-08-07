import React from "react";
import { toast } from "sonner";
import { RaisedButton, DeleteButton } from "@/app/widgets/widgets";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import { FaEyeDropper } from "react-icons/fa6";

// Define types for props
interface DetailsComponentProps {
  rowData: {
    ID: string;
    Product: string;
  };
  delete_product_url: string;
  EDIT_PRODUCT: string;
  onDelete: () => void;
}

const DetailsComponent: React.FC<DetailsComponentProps> = ({
  rowData,
  delete_product_url,
  EDIT_PRODUCT,

  onDelete,
}) => {
  const router = useRouter();

  const handleDelete = async (success: boolean) => {
    if (success) {
      onDelete();
      toast.success("Item Deleted");
    } else {
      toast.error("Error deleting item");
    }
  };

  return (
    <div className="p-2">
      <h3>Details for {rowData.Product}</h3>
      <div className="mt-5 border-t-2 border-gray-200 my-2"></div>
      <div className="flex flex-row space-x-2 items-center">
        <RaisedButton
          size="sm"
          color="primary"
          icon={<FaEyeSlash />}
          iconPosition="before"
          onClick={() => toast.warning("This feature is coming soon")}
        >
          Hide
        </RaisedButton>

        <RaisedButton
          size="sm"
          color="primary"
          icon={<FaEye />}
          iconPosition="before"
          onClick={() => toast.warning("This feature is coming soon")}
        >
          View
        </RaisedButton>
      </div>
    </div>
  );
};

export default DetailsComponent;
