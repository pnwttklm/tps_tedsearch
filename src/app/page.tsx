'use client';

import { useState } from 'react';

interface TEDTalk {
  title: string;
  speaker_1: string;
  event: string;
  url: string;
}

interface ElasticsearchHit {
  _source: TEDTalk;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [sourceLang, setSourceLang] = useState('auto'); // Default to 'auto' for autodetection
  const [translatedQuery, setTranslatedQuery] = useState('');
  const [results, setResults] = useState<ElasticsearchHit[]>([]);

  const handleSearch = async () => {
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&source_lang=${sourceLang}`
      );
      const data = await res.json();
  
      if (data.translatedQuery) {
        setTranslatedQuery(data.translatedQuery);
      }
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search Error:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">TED Talks Search</h1>
      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in any language..."
          className="border p-2 rounded w-full"
        />
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="mt-2 p-2 border rounded"
        >
          <option value="auto">Auto-detect</option>
          <option value="th">Thai</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="zh">Chinese</option>
          {/* Add more languages as needed */}
        </select>
        <button
          onClick={handleSearch}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {translatedQuery && (
        <p className="mt-4 text-gray-600">
          Translated Query: <strong>{translatedQuery}</strong>
        </p>
      )}

      <ul className="mt-6">
        {results.map((result, index) => (
          <li key={index} className="mb-4">
            <h2 className="font-semibold text-lg">{result._source.title}</h2>
            <p>Speaker: {result._source.speaker_1}</p>
            <p>Event: {result._source.event}</p>
            <a
              href={result._source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Watch Here
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}