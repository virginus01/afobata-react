import { FaInfo } from "react-icons/fa6";

const Tooltip = ({ text }: { text: string }) => {
  return (
    <div className="h-full">
      <div className="has-tooltip">
        <span className="tooltip rounded shadow-lg p-1 bg-gray-800 text-gray-100 -mt-8 max-w-40 text-xs">
          {text}
        </span>
        <FaInfo className="w-4 h-4 text-gray-600" />
      </div>{" "}
    </div>
  );
};

export default Tooltip;
