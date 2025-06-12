
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";

// This is a simple re-export to maintain backward compatibility
export const useToast = useToastOriginal;
export const toast = toastOriginal;
