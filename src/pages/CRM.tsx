
import { CRMHeader } from "@/components/crm/CRMHeader";
import { CRMSubscriptionAlerts } from "@/components/crm/CRMSubscriptionAlerts";
import { CRMMainContent } from "@/components/crm/CRMMainContent";
import { useCRMState } from "@/hooks/crm/useCRMState";

const CRM = () => {
  const {
    selectedInstanceId,
    setSelectedInstanceId,
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    loading,
    messagesLoading,
    limits,
    showSubscriptionAlert,
    blockedConversations,
    hasBlockedConversations,
    isAtMessageLimit,
    messageUsage,
    handleMessageSent,
    updateConversationAfterSend
  } = useCRMState();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <CRMHeader
          selectedInstanceId={selectedInstanceId}
          onInstanceChange={setSelectedInstanceId}
          messageUsage={messageUsage}
          isExpired={showSubscriptionAlert}
        />
      </div>

      {/* Subscription Alerts */}
      <div className="shrink-0">
        <CRMSubscriptionAlerts
          hasBlockedConversations={hasBlockedConversations}
          blockedConversationsCount={blockedConversations.length}
          conversationsCount={conversations.length}
          maxConversations={limits?.maxConversaciones}
          showSubscriptionAlert={showSubscriptionAlert}
          messageUsage={messageUsage}
          isAtMessageLimit={isAtMessageLimit}
        />
      </div>

      {/* Main Content - takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CRMMainContent
          conversations={conversations}
          selectedConversation={selectedConversation}
          messages={messages}
          loading={loading}
          messagesLoading={messagesLoading}
          blockedConversationsCount={blockedConversations.length}
          hasBlockedConversations={hasBlockedConversations}
          onSelectConversation={setSelectedConversation}
          onMessageSent={handleMessageSent}
          updateConversationAfterSend={updateConversationAfterSend}
          isAtMessageLimit={isAtMessageLimit}
          messageUsage={messageUsage}
        />
      </div>
    </div>
  );
};

export default CRM;
