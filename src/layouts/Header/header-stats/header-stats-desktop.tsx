import { Session } from "next-auth";
import { StatItem } from "@/components/shared/stat-item";
import TrendDelta from "@/components/shared/trend-delta";

export function HeaderStatsDesktop({ session }: { session: Session | null }) {
    if (!session) return null;

    return (
        <div className="flex h-full items-center justify-between mb:hidden">
            <div className="flex h-full w-full items-center justify-start [&_div]:flex-1">
                {/* Welcome Section */}
                <div className="flex h-full items-center justify-start gap-3 border-r border-bd-main py-4 pr-6 tb:hidden">
                    <div className="inline-flex flex-col items-start justify-start gap-1">
                        <div className="whitespace-nowrap text-xs font-normal leading-[1em] text-typo-note">
                            Welcome back,
                        </div>
                        <div className="text-sm font-medium leading-[1.5em] text-typo-primary">
                            {session?.user?.name}
                        </div>
                    </div>
                </div>

                {/* Balance Section */}
                <StatItem
                    className="tb:pl-0"
                    title="Your Balance"
                    value={
                        <div className="inline-flex items-center justify-start gap-1">
                            <div>£50,000,000</div>
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                <TrendDelta
                                    value={3.2}
                                    className="font-medium leading-3"
                                />
                            </div>
                        </div>
                    }
                />

                {/* Stats Sections */}
                <StatItem title="Casks Owned" value="12" />
                <StatItem title="Open Offers" value="3" />
                <StatItem title="Open Listing" value="-" />
                <StatItem
                    title="Ongoing Payments"
                    value="3"
                    borderRight={false}
                />
            </div>
            {/* Right side spacer */}
            <div className="hidden w-96 items-center justify-start self-stretch opacity-0 dk:flex" />
        </div>
    );
}
