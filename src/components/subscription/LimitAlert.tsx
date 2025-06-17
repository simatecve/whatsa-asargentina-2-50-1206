import React from "react";
import { AlertTriangle, Info, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
interface LimitAlertProps {
  type: 'warning' | 'error';
  title: string;
  description: string;
  current: number;
  max: number;
  planName: string;
}
export const LimitAlert = ({
  type,
  title,
  description,
  current,
  max,
  planName
}: LimitAlertProps) => {
  const isError = type === 'error';
  return;
};