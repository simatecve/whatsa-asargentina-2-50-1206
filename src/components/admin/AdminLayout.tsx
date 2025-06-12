
import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Card } from "@/components/ui/card";

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <Card className="w-full p-6 shadow-sm">
          <Outlet />
        </Card>
      </div>
    </div>
  );
};
