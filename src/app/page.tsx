"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface TEDTalk {
  title: string;
  speaker_1: string;
  event: string;
  url: string;
  recorded_date: string;
}

interface ElasticsearchHit {
  _source: TEDTalk;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [translatedQuery, setTranslatedQuery] = useState("");
  const [results, setResults] = useState<ElasticsearchHit[]>([]);
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(6);

  const handleSearch = async () => {
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(
          query
        )}&source_lang=${sourceLang}&page=${page}&show=${show}`
      );
      const data = await res.json();

      if (data.translatedQuery) {
        setTranslatedQuery(data.translatedQuery);
      }
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Search Error:", error);
    }
  };
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Trigger a search when `show` changes and reset to page 1
  useEffect(() => {
    setPage(1);
    handleSearch();
  }, [show]);

  return (
    <div className="p-4">
      <Image src='/logo.svg' alt="TEDx" width={300} height={300} />
      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in any language..."
          className="border p-2 rounded w-full"
        />
        <h1>Page: {page}</h1>
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="mt-2 p-2 border rounded"
        >
          <option value="th">Thai</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="zh">Chinese</option>
          {/* Add more languages as needed */}
        </select>

        <button
          onClick={() => {
            if (page > 1) {
              setPage(page - 1);
              handleSearch();
            }
          }}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={() => {
            setPage(page + 1);
            handleSearch();
          }}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>

        <select
          value={show}
          onChange={(e) => setShow(Number(e.target.value))}
          className="mt-2 p-2 border rounded"
        >
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
          <option value={96}>96</option>
        </select>

        <button
          onClick={() => {
            setPage(1); // Reset to page 1 on new search
            handleSearch();
          }}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {translatedQuery && (
        <p className="mt-4 text-gray-600">
          Showing the results of <strong>{translatedQuery}</strong>
        </p>
      )}

      <div className="mt-6 w-full grid grid-cols-3 grid-flow-row sm:overflow-auto">
        {results.map((result, index) => (
          <div key={index} className="mb-4 w-6/12">
            <iframe
              src={result._source.url.replace("https://www.", "https://embed.")}
              className="w-full"
            ></iframe>
            <div>
              <div className="flex flex-row justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    {result._source.title}
                  </h2>
                </div>
                <div>
                  <p className="text-white bg-red-600 w-fit px-1">
                    {result._source.event}
                  </p>
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <p>{result._source.speaker_1}</p>
                </div>
                <div>
                  <p>{formatDate(result._source.recorded_date)}</p>
                </div>
              </div>
            </div>

            <a
              href={result._source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Watch Here
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
