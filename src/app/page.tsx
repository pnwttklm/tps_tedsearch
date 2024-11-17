"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { BsArrowUpRight, BsChevronLeft, BsChevronRight } from "react-icons/bs";

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
      <Image src="/logo.svg" alt="TEDx" width={500} height={500} />
      <div className="mt-4 flex flex-col justify-center">
        <div className="space-x-4 flex flex-row justify-center">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="p-2 border-4 py-12 rounded-none border-black"
          >
            <option value="th">🇹🇭 Thai</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
            <option value="zh">🇨🇳 Chinese</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search TED Talks here..."
            className="border-4 p-2 w-4/12 rounded-none border-black"
          />
          <button
            onClick={() => {
              setPage(1); // Reset to page 1 on new search
              handleSearch();
            }}
            className=" bg-red-600 px-12 rounded-none text-white py-3"
          >
            Search
          </button>
          <select
            value={show}
            onChange={(e) => setShow(Number(e.target.value))}
            className="p-2 border-4 py-12 rounded-none border-black"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
        </div>
      </div>

      {translatedQuery && (
        <p className="mt-4 text-gray-600">
          Showing the results of <strong>{translatedQuery}</strong>
        </p>
      )}

      <div className="mt-6 w-full grid grid-cols-3 grid-flow-row sm:overflow-auto justify-center">
        {results.map((result, index) => (
          <div key={index} className="mb-4 w-6/12 space-y-3">
            <iframe
              src={result._source.url.replace("https://www.", "https://embed.")}
              className="w-full"
            ></iframe>
            <div className="space-y-3">
              <div className="flex flex-row justify-between">
                <div>
                  <h1 className="font-bold text-xl">
                    {result._source.title}
                  </h1>
                </div>
                <div>
                  <p className="text-white bg-red-600 w-fit px-1">
                    {result._source.event}
                  </p>
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <p className="text-gray-400">{result._source.speaker_1}</p>
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
              <BsArrowUpRight className="text-black" size={32} />
            </a>
          </div>
        ))}
      </div>
      {translatedQuery && (
        <div className="flex flex-row justify-center space-x-12">
          <button
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
                handleSearch();
              }
            }}
            className=" text-black flex flex-row place-items-center py-1 "
            disabled={page === 1}
          >
            <BsChevronLeft className="text-black" size={32} />
            <h1>Previous</h1>
          </button>
          <h1 className="font-bold text-3xl">{page}</h1>
          <button
            onClick={() => {
              setPage(page + 1);
              handleSearch();
            }}
            className=" text-black flex flex-row place-items-center py-1 "
          >
            <h1>Next</h1>
            <BsChevronRight className="text-black" size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
