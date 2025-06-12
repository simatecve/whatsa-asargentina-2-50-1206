
import { supabase } from "@/integrations/supabase/client";

// Colores para instancias de WhatsApp - naranja, azul, violeta, etc.
const defaultInstanceColors = [
  {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-800',
    icon: 'text-orange-600',
    name: 'Naranja',
    value: '#f97316'
  },
  {
    bg: 'bg-blue-50',
    border: 'border-blue-400', 
    text: 'text-blue-800',
    icon: 'text-blue-600',
    name: 'Azul',
    value: '#3b82f6'
  },
  {
    bg: 'bg-violet-50',
    border: 'border-violet-400',
    text: 'text-violet-800', 
    icon: 'text-violet-600',
    name: 'Violeta',
    value: '#8b5cf6'
  },
  {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    icon: 'text-green-600',
    name: 'Verde',
    value: '#10b981'
  },
  {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    icon: 'text-red-600',
    name: 'Rojo',
    value: '#ef4444'
  },
  {
    bg: 'bg-pink-50',
    border: 'border-pink-400',
    text: 'text-pink-800',
    icon: 'text-pink-600',
    name: 'Rosa',
    value: '#ec4899'
  }
];

const getColorClassesByValue = (colorValue: string) => {
  const colorMap: Record<string, any> = {
    '#f97316': defaultInstanceColors[0], // Naranja
    '#3b82f6': defaultInstanceColors[1], // Azul
    '#8b5cf6': defaultInstanceColors[2], // Violeta
    '#10b981': defaultInstanceColors[3], // Verde
    '#ef4444': defaultInstanceColors[4], // Rojo
    '#ec4899': defaultInstanceColors[5], // Rosa
    '#6366f1': {
      bg: 'bg-indigo-50',
      border: 'border-indigo-400',
      text: 'text-indigo-800',
      icon: 'text-indigo-600',
      name: 'Índigo',
      value: '#6366f1'
    },
    '#eab308': {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      name: 'Amarillo',
      value: '#eab308'
    }
  };

  return colorMap[colorValue] || defaultInstanceColors[3]; // Default to green
};

export const getInstanceColor = (instanceName: string, customColor?: string) => {
  if (customColor) {
    return getColorClassesByValue(customColor);
  }
  
  // Create a simple hash from the instance name to ensure consistent color assignment
  let hash = 0;
  for (let i = 0; i < instanceName.length; i++) {
    const char = instanceName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % defaultInstanceColors.length;
  return defaultInstanceColors[index];
};

export const getInstanceColorByName = async (instanceName: string, allInstances: string[]) => {
  try {
    // Try to get custom color from database
    const { data: instance } = await supabase
      .from('instancias')
      .select('color')
      .eq('nombre', instanceName)
      .single();

    if (instance?.color) {
      return getColorClassesByValue(instance.color);
    }
  } catch (error) {
    console.error('Error fetching instance color:', error);
  }

  // Fallback to default color assignment
  return getInstanceColor(instanceName);
};
