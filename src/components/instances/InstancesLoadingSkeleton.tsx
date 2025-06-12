
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface InstancesLoadingSkeletonProps {
  count?: number;
}

const InstancesLoadingSkeleton = ({ count = 3 }: InstancesLoadingSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="bg-gray-100 h-24"></CardHeader>
          <CardContent className="py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InstancesLoadingSkeleton;
