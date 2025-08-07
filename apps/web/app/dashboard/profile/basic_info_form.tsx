"use client";
import React from "react";
import FormInput from "@/app/widgets/hook_form_input";
import { UseFormReturn } from "react-hook-form";
import { SearchableSelect } from "@/app/widgets/searchable_select";

interface BasicInfoFormProps {
  formData: UserTypes;
  setValue: (name: string, value: string) => void;
  action?: string;
  methods: UseFormReturn<any>;
  user: UserTypes;
}

export default function BasicInfoForm({
  formData,
  action,
  methods,
  setValue,
  user,
}: BasicInfoFormProps) {
  return (
    <div className="flex flex-col space-y-5">
      <div className="flex flex-row justify-between items-center w-full space-x-2">
        <FormInput name="firstName" label="First Name" />
        <FormInput name="lastName" label="Last Name" />
      </div>

      <SearchableSelect
        controlled={true}
        className="my-4"
        name="gender"
        label="Your Gender"
        showSearch={false}
        items={[
          { value: "", label: "Select Gender" },
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "none", label: "Prefer not to say" },
        ]}
        onSelect={(v) => {
          setValue("gender", v as any);
        }}
        defaultValues={[user?.gender ?? ""]}
      />

      <FormInput
        name="dob"
        label="Your date of birth"
        type="date"
        className="flex flex-row justify-between w-full items-center"
      />

      <FormInput name="phone" label="Your Phone Number" type="number" />
    </div>
  );
}
