
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

export const useURLParams = () => {
  const location = useLocation();
  
  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
  
  const getParam = (key: string): string | null => {
    return searchParams.get(key);
  };
  
  const getAllParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  };

  return {
    getParam,
    getAllParams,
    searchParams
  };
};
