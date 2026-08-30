import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  assessmentCsvFilename,
  buildAssessmentResultsCsv,
} from "@/lib/assessment-csv";
import { getOwnedSubmission } from "@/lib/assessments";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const owned = await getOwnedSubmission(id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (owned.submission.status !== "completed") {
    return NextResponse.json(
      { error: "Only completed assessments can be exported." },
      { status: 400 },
    );
  }

  const csv = buildAssessmentResultsCsv(owned);
  const filename = assessmentCsvFilename(owned.submission.title);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
