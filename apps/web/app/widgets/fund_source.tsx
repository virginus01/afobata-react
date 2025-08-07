import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

const FundSourcesWidget = ({
  setValue,
  user,
  sources,
}: {
  setValue: (name: string, value: any) => void;
  user: UserTypes;
  sources: _FundSouces[];
}) => {
  const [defaultAcc, setDefaultAcc] = useState(user.accountNumber);

  const scrollContainerRef: any = useRef(null);

  const scroll = (direction: any) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250; // Adjust based on your card width
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  let paymentOptions: _FundSouces[] = sources;

  return (
    <div className="relative w-full flex items-center">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="hidden lg:block absolute left-0 z-10 rounded-full p-1 bg-gray-50 hover:bg-gray-200"
      >
        <ChevronLeft size={24} />
      </button>
      <div
        className="flex flex-row space-x-2 overflow-x-auto scrollbar-hide mx-1 sm:mx-8"
        ref={scrollContainerRef}
      >
        {paymentOptions.map((account, i) => (
          <div
            className="w-64 rounded-lg border border-gray-200 bg-gray-50 p-2 ps-4 dark:border-gray-700 dark:bg-gray-800"
            key={i}
          >
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  onChange={(e) => {
                    setDefaultAcc(e.target.value);
                    setValue("account", e.target.value);
                  }}
                  checked={defaultAcc === account?.accountNumber}
                  id={`account-${account.id}`} // Updated to use a unique id
                  aria-describedby="c"
                  type="radio"
                  name="payment-method"
                  value={account?.accountNumber}
                  className="h-4 w-4 border-gray-300 bg-white text-primary-600 focus:ring-2 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                />
              </div>

              <div className="ms-4 text-xs">
                <label
                  htmlFor={`account-${account.id}`} // Updated to match the unique id
                  className={`font-medium leading-none ${
                    account.disabled ? "text-gray-400" : "text-gray-900"
                  }  dark:text-white whitespace-nowrap`}
                >
                  {account.bankInfo?.name ?? account.bankInfo?.accountName}
                </label>

                <p
                  id="credit-card-text"
                  className={`mt-1 text-xs font-normal ${
                    account.disabled ? "text-gray-300" : "text-gray-500"
                  }  dark:text-gray-400 whitespace-nowrap max-w-xs truncate`}
                >
                  {account.accountName ?? ""}
                </p>
                <p
                  id="credit-card-text"
                  className={`mt-1 text-xs font-normal ${
                    account.disabled ? "text-gray-300" : "text-gray-500"
                  }  dark:text-gray-400 whitespace-nowrap max-w-xs truncate`}
                >
                  {account.accountNumber}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="hidden lg:block md:block absolute right-0 z-10 rounded-full p-1 bg-gray-50 hover:bg-gray-200"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default FundSourcesWidget;
