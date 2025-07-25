# Phase 1: Core Unstructured Data Engine

This phase introduces the foundational pieces for processing any document type.

## Features

- **Ingestion** of PDFs, CSV files, plain text blobs and email attachments.
- **Document chunking** with 1k character segments.
- **Vector embeddings** generated via OpenAI and stored using the `pgvector` extension.
- **Natural language Q&A** over uploaded content via `/api/agent/ask`.
- **AI summaries and entity tags** stored in the `documents` table.

The new `document_chunks` table keeps embeddings per chunk to enable fast
similarity search. The backend automatically populates this table whenever a
document is parsed.
