import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TicketListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-6 rounded-2xl border-white/5 bg-card-bg/50 backdrop-blur-md flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />

                    <div className="flex-1 min-w-0 w-full space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-16 bg-white/5" />
                            <Skeleton className="h-6 w-1/2 bg-white/5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-24 bg-white/5" />
                            <Skeleton className="h-4 w-32 bg-white/5" />
                            <Skeleton className="h-4 w-20 bg-white/5" />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0">
                        <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
                        <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
                    </div>
                </Card>
            ))}
        </div>
    );
}
