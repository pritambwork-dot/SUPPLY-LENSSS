# Data Provenance

Every critical field maintains provenance tracking.

Fields tracked:
- `source`: The provider or origin of the data.
- `source_url`: The URL where the data was found.
- `retrieved_at`: The exact timestamp of extraction.
- `evidence`: The raw text or snapshot supporting the fact.
- `confidence`: System confidence score in the data point.

When sources conflict, the system retains all observations and relies on verification policies to determine the canonical value.
