import { auth } from '@/auth';
import { getUserById } from '@/lib/user';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { KYCCard } from '@/components/dashboard/KYCCard';
import { SupportCard } from '@/components/dashboard/SupportCard';

export default async function DashboardPage() {
    const session = await auth();

    // Fetch user data from database
    const dbUser = session?.user?.id ? await getUserById(session.user.id) : null;

    // Get KYC status from user data
    const kycStatus = dbUser?.kycStatus || 'UNVERIFIED';

    // TODO: Replace with real data from database
    const stats = [
        {
            label: 'Active Orders',
            value: '0',
            subValue: 'No active orders',
            iconName: 'history' as const,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            label: 'Total Volume',
            value: '$0.00',
            subValue: '0 transactions',
            iconName: 'wallet' as const,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
        },
        {
            label: 'KYC Status',
            value: kycStatus,
            subValue: kycStatus === 'APPROVED' ? 'Fully Verified' : 'Verification Required',
            iconName: 'dashboard' as const,
            color: kycStatus === 'APPROVED' ? 'text-green-500' : 'text-yellow-500',
            bg: kycStatus === 'APPROVED' ? 'bg-green-500/10' : 'bg-yellow-500/10',
        },
    ];

    // TODO: Fetch real activity from database
    const recentActivities: Array<{
        type: 'buy' | 'sell';
        asset: string;
        amount: string;
        date: string;
        status: string;
    }> = [];

    const firstName = dbUser?.firstName || session?.user?.name?.split(' ')[0] || 'Trader';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Section */}
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">
                    Welcome back, <span className="text-gradient">{firstName}</span>!
                </h1>
                <p className="text-foreground/40 font-medium">
                    Here&apos;s a quick overview of your crypto activity today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <RecentActivity activities={recentActivities} />

                {/* Account Status / Actions */}
                <div className="space-y-8">
                    {/* KYC Quick Action */}
                    <KYCCard kycStatus={kycStatus} userName={firstName} />

                    {/* Support Card */}
                    <SupportCard />
                </div>
            </div>
        </div>
    );
}
