import { NextRequest, NextResponse } from "next/server";
import { addDummyData } from "@/action/seed-data";

export async function POST(request: NextRequest) {
  try {
    const result = await addDummyData();
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      }, 
      { status: 500 }
    );
  }
}
