# Deep-Dive Study Guide — Index
### AI-Powered Financial Document Similarity Finder

> Each file is a standalone deep dive into one technology: every component explained, the *why* behind each design choice, how it's used in this project, common pitfalls, practice exercises, and self-check questions. Study them one at a time.

---

## Modules

1. [PostgreSQL — Relational Database](deep-dive-module-01-postgresql.md)
2. [Qdrant — Vector Database](deep-dive-module-02-qdrant.md)
3. [React — Frontend Framework](deep-dive-module-03-react.md)
4. [Spring Boot — Java Backend](deep-dive-module-04-spring-boot.md)
5. [Python + Sentence Transformers — Embedding Service](deep-dive-module-05-python-embeddings.md)
6. [Docker & Docker Compose — Infrastructure](deep-dive-module-06-docker.md)
7. [Tesseract OCR — Text from Images](deep-dive-module-07-tesseract-ocr.md)
8. [JWT — Authentication & Authorization](deep-dive-module-08-jwt-auth.md)
9. [Apache PDFBox & Apache POI — File Parsing](deep-dive-module-09-pdfbox-poi.md)
10. [How Everything Connects Together](deep-dive-module-10-how-it-connects.md)

---

## Recommended study order

```
1  PostgreSQL   → every component stores/retrieves data here
2  Docker       → you need it to run Qdrant + PostgreSQL locally
3  Python/Flask → simplest intro to REST APIs
4  Sentence Transformers → vectors are the core concept of the project
5  Qdrant       → now you know what you're storing and why
6  Spring Boot  → the orchestrator that connects everything
7  React        → the user-facing layer calling the API
8  JWT          → security wraps everything; easier after the APIs
9  PDFBox/POI/Tesseract → the input side: how data enters the pipeline
10 Everything Together → trace one upload and one search end to end
```

> Tip: read Module 10 last, but skim it first too — seeing the whole map makes each individual module easier to place.

---

*Covers: PostgreSQL · Qdrant · React · Spring Boot · Python/Sentence Transformers · Docker · Tesseract OCR · JWT · Apache PDFBox · Apache POI*
