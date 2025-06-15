
/**
 * Utility functions for contact validation
 */

// Regex for validating phone numbers (8-15 digits, may start with +)
export const phoneRegex = /^\+?[0-9]{8,15}$/;

export type Contact = {
  name: string;
  phone_number: string;
  valid: boolean;
  error?: string;
};

export const validateContact = (contact: Partial<Contact>): Contact => {
  const valid = !!(
    contact.name && 
    contact.name.trim() !== "" && 
    contact.phone_number && 
    phoneRegex.test(contact.phone_number)
  );
  
  let error = "";
  if (!contact.name || contact.name.trim() === "") {
    error = "Nombre vacío";
  } else if (!contact.phone_number) {
    error = "Número vacío";
  } else if (!phoneRegex.test(contact.phone_number)) {
    error = "Formato de número inválido";
  }
  
  return {
    name: contact.name || "",
    phone_number: contact.phone_number || "",
    valid,
    error: valid ? undefined : error,
  };
};

/**
 * Normalizes a phone number by ensuring it has the correct format
 * @param phone The phone number to normalize
 * @returns Normalized phone number
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Return the phone number as is - let the user provide the complete number
  return phone;
};
