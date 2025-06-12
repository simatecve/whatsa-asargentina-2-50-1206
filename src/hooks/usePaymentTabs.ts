
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const usePaymentTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("transactions");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["transactions", "methods", "mercadopago", "paypal", "reports"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return {
    activeTab,
    handleTabChange
  };
};
