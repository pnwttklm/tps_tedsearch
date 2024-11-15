// app/api/search/route.ts
import { NextResponse } from "next/server";
import client from "@/lib/elasticsearch";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const sourceLang = searchParams.get("source_lang") || "en"; // Default to auto-detect
  const page = parseInt(searchParams.get("page") || "1", 10);
  const show = parseInt(searchParams.get("show") || "6", 10);
  try {
    // Step 1: Translate
    const translationRes = await fetch(
      `https://655.mtis.workers.dev/translate?text=${encodeURIComponent(
        query
      )}&source_lang=${sourceLang}&target_lang=en`
    );

    if (!translationRes.ok) {
      console.error(
        "Translation API Error:",
        translationRes.status,
        translationRes.statusText
      );
      return NextResponse.json(
        { error: "Translation API failed" },
        { status: 500 }
      );
    }

    const translationData = await translationRes.json();

    if (
      !translationData ||
      !translationData.response ||
      !translationData.response.translated_text
    ) {
      console.error("Invalid Translation Response:", translationData);
      return NextResponse.json(
        { error: "Invalid translation response" },
        { status: 500 }
      );
    }

    const translatedQuery = translationData.response.translated_text;
    console.log("Translated Query:", translatedQuery);

    // Step 2: Search Elasticsearch
    const result = await client.search({
      index: "ted",
      body: {
        _source: ["title", "speaker_1", "event", "url"],
        size: show,
        from: page > 1 ? (page - 1) * show : 0,
        query: {
          multi_match: {
            query: translatedQuery,
            fields: [
              "title^1.5",
              "speaker_1^1.2",
              "topics",
              "all_speakers",
              "occupations",
              "about_speakers^1.2",
              "event",
              "description",
              "transcript^1.2",
            ],
            slop: 2,
            fuzziness: "auto",
            fuzzy_transpositions: true,
          },
        },
      },
    });

    return NextResponse.json({ translatedQuery, results: result.hits.hits });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
