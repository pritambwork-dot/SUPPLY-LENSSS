# Real Data Architecture

## Flow
1. **User Request** -> Gemini Intent Extraction
2. **Discovery** -> Nimble web discovery & Approved government datasets
3. **Extraction** -> Apify extracts actual published content
4. **Enrichment** -> Geoapify for coordinates and logistics
5. **Entity Resolution** -> De-duplicate based on exact/strong matches
6. **Verification Engine** -> Evaluates evidence
7. **Canonical Record** -> Stored in Supabase
8. **Recommendation Engine** -> Ranks verified pool
