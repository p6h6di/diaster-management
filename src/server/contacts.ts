"use server";

import { ContactFormData, contactSchema } from "@/app/schema/contact";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
};

export const getAllContacts = cache(async (): Promise<Contact[]> => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return contacts;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw new Error("Failed to fetch contacts");
  }
});

export async function parseContactForm(
  formData: FormData
): Promise<ContactFormData> {
  const name = formData.get("name")?.toString()?.trim() || "";
  const phoneNumber = formData.get("phone")?.toString()?.trim() || "";
  const relationship = formData.get("relationship")?.toString()?.trim() || "";

  const result = contactSchema.safeParse({
    name,
    phoneNumber,
    relationship,
  });

  if (!result.success) {
    const formattedErrors = result.error.format();
    throw new Error(
      JSON.stringify({
        message: "Validation failed",
        errors: formattedErrors,
      })
    );
  }

  return result.data;
}

export async function createContact(formData: FormData) {
  try {
    const validatedData = await parseContactForm(formData);

    await prisma.contact.create({
      data: validatedData,
    });

    revalidatePath("/contacts");

    return { success: true };
  } catch (error) {
    console.error("Error creating contact:", error);

    if (error instanceof Error) {
      try {
        const parsedError = JSON.parse(error.message);
        return {
          success: false,
          error: parsedError.message,
          validationErrors: parsedError.errors,
        };
      } catch {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function deleteContact(contactId: string) {
  try {
    if (!contactId) {
      return {
        success: false,
        error: "Contact ID is required",
      };
    }

    await prisma.contact.delete({
      where: {
        id: contactId,
      },
    });

    revalidatePath("/contacts");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting contact:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while deleting the contact",
    };
  }
}
