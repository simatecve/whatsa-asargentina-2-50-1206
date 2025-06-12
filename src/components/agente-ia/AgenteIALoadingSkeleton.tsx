
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const AgenteIALoadingSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-20 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
