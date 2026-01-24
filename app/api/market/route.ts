import { NextResponse } from "next/server";
import { fetchRawMarketData } from "@/lib/market-api";

export async function GET() {
    const data = await fetchRawMarketData();

    if (!data) {
        return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
    }

    return NextResponse.json(data);
}
