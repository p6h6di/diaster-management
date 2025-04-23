"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Phone } from "lucide-react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createContact, getAllContacts } from "@/server/contacts";
import DisplayContacts from "./display-contacts";
import { ContactFormData, contactSchema } from "@/app/schema/contact";
import { Contact } from "@prisma/client";

const relationshipOptions = [
  "Parent",
  "Child",
  "Sibling",
  "Spouse",
  "Partner",
  "Grandparent",
  "Grandchild",
  "Aunt/Uncle",
  "Niece/Nephew",
  "Cousin",
  "Friend",
  "Colleague",
  "Neighbor",
  "Teacher/Student",
  "In-law",
  "Guardian",
  "Step-relation",
  "Other",
] as const;

type RelationshipOption = (typeof relationshipOptions)[number];

type FormErrors = {
  [K in keyof ContactFormData]?: string;
} & {
  form?: string;
};

const ContactForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phoneNumber: "",
    relationship: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const allContacts = await getAllContacts();
        setContacts(allContacts);
      } catch (error) {
        toast.error("Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleRelationshipChange = (value: RelationshipOption): void => {
    setFormData((prev) => ({ ...prev, relationship: value }));
    if (errors.relationship) {
      setErrors((prev) => ({ ...prev, relationship: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      contactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const submitContact = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("phone", formData.phoneNumber);
    formDataObj.append("relationship", formData.relationship);

    startTransition(async () => {
      try {
        const result = await createContact(formDataObj);
        if (result?.success) {
          toast.success("Contact added successfully!");
          setFormData({ name: "", phoneNumber: "", relationship: "" });
          const allContacts = await getAllContacts();
          setContacts(allContacts);
        } else {
          if (result?.validationErrors) {
            const serverErrors: FormErrors = {};
            Object.entries(result.validationErrors).forEach(([key, value]) => {
              if (key === "_errors") return;
              if (
                value &&
                typeof value === "object" &&
                "_errors" in value &&
                Array.isArray(value._errors) &&
                value._errors.length
              ) {
                serverErrors[key as keyof ContactFormData] = value._errors[0];
              }
            });
            setErrors(serverErrors);
            toast.error("Please fix the form errors");
          } else {
            toast.error(result?.error || "Failed to add contact");
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="size-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 w-full max-w-5xl mx-auto gap-6 my-12">
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6 w-full transition-all duration-300">
        <form className="space-y-4" onSubmit={submitContact}>
          <div className="relative">
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2 text-zinc-400"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/50 border ${
                errors.name ? "border-red-500" : "border-white/5"
              } rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all`}
              placeholder="Enter your name"
              autoComplete="off"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-2 text-zinc-400"
            >
              Phone number
            </label>
            <input
              type="text"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/50 border ${
                errors.phoneNumber ? "border-red-500" : "border-white/5"
              } rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent transition-all`}
              placeholder="Enter your phone number"
              autoComplete="off"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="relationship"
              className="block text-sm font-medium mb-2 text-zinc-400"
            >
              Relationship
            </label>
            <Select
              value={formData.relationship}
              onValueChange={handleRelationshipChange}
            >
              <SelectTrigger className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 px-4 py-6 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border border-zinc-800 text-white">
                {relationshipOptions.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="focus:bg-zinc-800 focus:text-white"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.relationship && (
              <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-8 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-sky-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isPending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
            <span>{isPending ? "Adding..." : "Add Contact"}</span>
          </button>
        </form>
      </div>

      <div>
        <DisplayContacts contacts={contacts} />
      </div>
    </div>
  );
};

export default ContactForm;
