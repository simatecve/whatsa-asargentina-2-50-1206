
import { supabase } from "@/integrations/supabase/client";

export const useContactsStats = () => {
  const getContactsStats = async (userId: string) => {
    const { count: contactsCount, error: contactsError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (contactsError) {
      console.error("Error obteniendo contactos:", contactsError);
      throw contactsError;
    }

    const totalContacts = contactsCount || 0;
    console.log(`Contactos: ${totalContacts}`);

    return { totalContacts };
  };

  return { getContactsStats };
};
