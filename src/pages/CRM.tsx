
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
    hasMoreMessages,
    handleMessageSent,
    updateConversationAfterSend,
    handleLoadMoreMessages
  } = useCRMState();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
          hasMoreMessages={hasMoreMessages}
          onLoadMoreMessages={handleLoadMoreMessages}
        />
      </div>
    </div>
  );
};

export default CRM;
