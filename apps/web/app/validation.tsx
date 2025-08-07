// formValidation.ts
type ValidationRule = {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

type FormErrors = {
  [key: string]: string;
};

type FormData = {
  [key: string]: any; // Index signature
};

export const validateForm = (
  formData: FormData,
  validationRules: ValidationRules,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
): FormErrors => {
  const newErrors: FormErrors = {};

  for (const field in validationRules) {
    const rule = validationRules[field];
    const value = formData[field];
    const number = Number(value);

    if (rule.required && !value) {
      newErrors[field] = rule.message || `${field} is required`;
    } else if (!isNaN(number) && isFinite(number) && number < rule.min!) {
      newErrors[field] = `minimum for this is ${rule.min}`;
    } else if (!isNaN(number) && isFinite(number) && number > rule.max!) {
      newErrors[field] = `maximum for this is ${rule.max}`;
    }
  }

  setErrors(newErrors);
  return newErrors;
};

export const getValidationRules = (type: string): ValidationRules => {
  switch (type) {
    case "data":
      return {
        sp: { required: true, message: "Network is required" },
        productId: { required: true, message: "Data Plan is required" },
        beneficiaryMobileNumbers: {
          required: true,
          message: "Mobile Number(s) is required",
        },
      };
    case "electric":
      return {
        sp: { required: true, message: "Disco Company is required" },
        productId: { required: true, message: "Meter Type is required" },
        subTotal: {
          required: true,
          message: "Unit Amount is required",
          max: 50000,
          min: 1000,
        },
        meterNumber: {
          required: true,
          message: "Meter Number is required",
        },
      };

    case "tv":
      return {
        sp: { required: true, message: "Service Provider is required" },
        productId: { required: true, message: "Package is required" },
        iucNumber: {
          required: true,
          message: "IUC Number is required",
        },
      };

    case "airtime":
      return {
        sp: { required: true, message: "Service Provider is required" },
        subTotal: {
          required: true,
          message: "Amount is required",
          min: 50,
          max: 5000,
        },
      };

    case "betting":
      return {
        sp: { required: true, message: "Service Provider is required" },
        productId: { required: true, message: "betting plan is required" },
        subTotal: {
          required: true,
          message: "Amount is required",
          min: 500,
          max: 50000,
        },
        customerId: { required: true, message: "customer id is required" },
      };

    default:
      throw new Error(`Unknown validation type: ${type}`);
  }
};
