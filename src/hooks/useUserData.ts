
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/contexts/types";

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Error getting user:", authError);
        return;
      }

      if (user) {
        const { data: userData, error: userDataError } = await supabase
          .from('usuarios')
          .select('nombre, email, perfil')
          .eq('user_id', user.id)
          .single();
        
        if (userDataError) {
          console.error("Error fetching user data:", userDataError);
          return;
        }
        
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return { userData };
};
