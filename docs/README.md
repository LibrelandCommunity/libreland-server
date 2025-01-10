# Libreland Server Documentation

This directory contains comprehensive documentation for the Libreland server project, which aims to recreate the Anyland server functionality. Below is an overview of the available documentation files.

## Core Documentation

- [API Endpoints](./api-endpoints.md) - Detailed documentation of all server API endpoints and their request/response formats
- [Data Structure](./data-structure.md) - Overview of the data directory structure and organization
- [Data Relationships](./data-relationships.md) - Description of how different data types relate to each other

## Format Specifications

- [Thing Format](./thing-format.md) - Current specification for the Thing definition format
- [Thing Format (Original)](./thing-format-original.md) - Original Anyland Thing format specification
- [Area Format (Original)](./area-format-original.md) - Original Anyland Area format specification

## Directory Structure

```
docs/
├── README.md              # This file
├── api-endpoints.md       # API endpoint documentation
├── area-format-original.md# Original Anyland area format
├── data-relationships.md  # Data relationship diagrams
├── data-structure.md      # Data directory structure
├── thing-format.md       # Current thing format spec
└── thing-format-original.md# Original thing format spec
```

## Contributing

When adding new documentation:

1. Follow the existing markdown formatting style
2. Add your new document to this README
3. Link to related documentation where appropriate
4. Include examples where helpful
5. Keep specifications and current implementations separate

## Format Guidelines

- Use markdown for all documentation
- Include code examples in appropriate language-specific code blocks
- Use diagrams (mermaid) for complex relationships
- Keep one topic per file
- Maintain separation between original Anyland specs and current implementation
