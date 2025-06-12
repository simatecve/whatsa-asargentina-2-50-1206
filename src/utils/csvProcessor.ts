
import { Contact, validateContact, normalizePhoneNumber } from "./contactValidation";

/**
 * Process CSV text content and convert it to Contact objects
 * @param text The CSV text content
 * @returns Array of processed contacts
 */
export const processCSV = (text: string): Contact[] => {
  try {
    const rows = text.split(/\r?\n/);
    const processed: Contact[] = [];
    
    // Skip header row if it exists (check if first row has headers)
    const startRow = rows[0].toLowerCase().includes('nombre') || rows[0].toLowerCase().includes('telefono') ? 1 : 0;
    
    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;
      
      // Support both comma and semicolon as separators
      const separator = row.includes(';') ? ';' : ',';
      const cells = row.split(separator);
      
      // Support both orders: name,phone or phone,name
      let name, phone;
      if (cells.length >= 2) {
        // Try to detect which is which - phone numbers usually have digits
        if (/\d/.test(cells[0]) && !/\d/.test(cells[1])) {
          // First column is phone, second is name
          [phone, name] = [cells[0].trim(), cells[1].trim()];
        } else {
          // Assume name then phone is the default order
          [name, phone] = [cells[0].trim(), cells[1].trim()];
        }
        
        // Normalize phone number
        phone = normalizePhoneNumber(phone);
        
        const contact = validateContact({ name, phone_number: phone });
        processed.push(contact);
      }
    }
    
    return processed;
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    return [];
  }
};
