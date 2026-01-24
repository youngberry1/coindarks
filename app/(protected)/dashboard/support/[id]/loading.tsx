import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-2rem)] flex flex-col gap-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                    <Skeleton className="h-6 w-32 bg-white/5" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-96 bg-white/5" />
                    <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden bg-card-bg/50 backdrop-blur-3xl border-white/5 rounded-[32px] shadow-2xl relative">
                {/* Chat Area Skeleton */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                    {/* Admin Message Skeleton (Left) */}
                    <div className="flex justify-start">
                        <div className="flex items-end gap-3 max-w-[85%] md:max-w-[70%]">
                            <Skeleton className="h-8 w-8 rounded-full bg-white/5 shrink-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-[80px] w-[280px] md:w-[400px] rounded-2xl rounded-bl-none bg-white/5" />
                                <Skeleton className="h-3 w-24 bg-white/5 ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* User Message Skeleton (Right) */}
                    <div className="flex justify-end">
                        <div className="flex items-end gap-3 max-w-[85%] md:max-w-[70%] flex-row-reverse">
                            <Skeleton className="h-8 w-8 rounded-full bg-white/5 shrink-0" />
                            <div className="space-y-2 flex flex-col items-end">
                                <Skeleton className="h-[60px] w-[240px] md:w-[350px] rounded-2xl rounded-br-none bg-primary/10" />
                                <Skeleton className="h-3 w-24 bg-white/5 mr-1" />
                            </div>
                        </div>
                    </div>

                    {/* Admin Message Skeleton (Left) */}
                    <div className="flex justify-start">
                        <div className="flex items-end gap-3 max-w-[85%] md:max-w-[70%]">
                            <Skeleton className="h-8 w-8 rounded-full bg-white/5 shrink-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-[40px] w-[200px] md:w-[300px] rounded-2xl rounded-bl-none bg-white/5" />
                                <Skeleton className="h-3 w-24 bg-white/5 ml-1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Area Skeleton */}
                <div className="p-4 md:p-6 bg-black/20 border-t border-white/5 backdrop-blur-xl">
                    <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-3xl p-2 pl-6">
                        <div className="flex-1 py-3">
                            <Skeleton className="h-5 w-48 bg-white/5" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full bg-primary/20" />
                    </div>
                    <div className="flex justify-center mt-3">
                        <Skeleton className="h-3 w-64 bg-white/5" />
                    </div>
                </div>
            </Card>
        </div>
    );
}
