"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Loader, Trash2, Phone, User, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Contact } from "@prisma/client";
import { deleteContact, getAllContacts } from "@/server/contacts";
import Avvvatars from "avvvatars-react";

const ContactCard: React.FC<{
  contact: Contact;
  onDelete: (id: string) => void;
  onEdit: (contact: Contact) => void;
}> = ({ contact, onDelete, onEdit }) => {
  return (
    <div
      className="bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-white/5 p-4 
                  hover:border-white/10 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className=" h-10 w-10 rounded-full 
                        flex items-center justify-center"
          >
            <Avvvatars value={contact.phoneNumber} size={40} style="shape" />
          </div>
          <div>
            <h3 className="font-medium text-white text-lg">{contact.name}</h3>
            <span className="text-zinc-400 text-sm">
              {contact.relationship}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(contact.id)}
            className="p-2 rounded-lg bg-white/5 transition-all"
          >
            <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-zinc-400">
        <Phone className="w-4 h-4" />
        <span>{contact.phoneNumber}</span>
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div
      className="flex flex-col items-center justify-center h-full min-h-96 bg-zinc-900/30 
                  border border-dashed border-white/10 rounded-xl p-6"
    >
      <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
        <UserPlus className="w-8 h-8 text-zinc-400" />
      </div>
      <h3 className="text-white font-medium text-lg mb-2">No contacts yet</h3>
      <p className="text-zinc-400 text-center mb-4">
        Start building your contact list by adding your first contact.
      </p>
    </div>
  );
};

interface DisplayContactsProps {
  contacts: Contact[];
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
}

const DisplayContacts: React.FC<DisplayContactsProps> = ({
  contacts: initialContacts,
  onEdit = () => {},
}) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    startTransition(() => {
      if (value) {
        const filtered = initialContacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(value.toLowerCase()) ||
            contact.phoneNumber.includes(value)
        );
        setContacts(filtered);
      } else {
        setContacts(initialContacts);
      }
    });
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilter(value);

    startTransition(() => {
      if (value) {
        const filtered = initialContacts.filter(
          (contact) => contact.relationship === value
        );
        setContacts(filtered);
      } else {
        setContacts(initialContacts);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const result = await deleteContact(id);
      if (result.success) {
        setContacts(contacts.filter((contact) => contact.id !== id));
        toast.success("Contact deleted successfully!");
      } else {
        toast.error("Failed to delete contact");
      }
    }
  };

  const relationshipOptions = Array.from(
    new Set(initialContacts.map((contact) => contact.relationship))
  ).filter(Boolean);

  return (
    <div className="w-full h-full">
      {/* Contacts List */}
      <div className="grid gap-4">
        {isPending ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader className="size-8 text-sky-500 animate-spin" />
          </div>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={handleDelete}
              onEdit={onEdit}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

// Keep ContactCard and EmptyState components the same as before

export default DisplayContacts;
