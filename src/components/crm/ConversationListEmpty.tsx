
export const ConversationListEmpty = () => {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
      <div className="text-center">
        <p>No hay conversaciones disponibles</p>
        <p className="text-sm mt-2">Los números que te escriban aparecerán aquí</p>
      </div>
    </div>
  );
};
