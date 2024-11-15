// lib/elasticsearch.ts
import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: process.env.ELASTICSEARCH_URL, // Access the URL from .env
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || "",
    password: process.env.ELASTICSEARCH_PASSWORD || "",
  },
});

export default client;
