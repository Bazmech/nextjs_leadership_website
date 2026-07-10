import { NextResponse } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";
import { createClient } from "@/prismicio";

export async function GET(request) {
  const client = createClient();

  return redirectToPreviewURL({ client, request });
}
