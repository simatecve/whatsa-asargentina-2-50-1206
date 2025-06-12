
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800';
    case 'creada':
      return 'bg-blue-100 text-blue-800';
    case 'disconnected':
      return 'bg-yellow-100 text-yellow-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
