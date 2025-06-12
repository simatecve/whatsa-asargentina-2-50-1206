
export type ContactList = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  contacts_count?: number;
};

export type Contact = {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
};
