
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CampanasLoading = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[180px]" />
            </div>
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </Card>
      ))}
    </div>
  );
};
