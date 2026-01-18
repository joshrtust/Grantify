# Import Scholarships to Firebase

This guide explains how to import the `scholarships-canada-2026-01-18.json` file into your Firebase Firestore database.

## Prerequisites

- Firebase is already installed in your project
- You have the JSON file in the `backend/` directory
- Your Firebase configuration is set up correctly

## How to Run

### Option 1: Using npm script (Recommended)

```bash
npm run import-scholarships
```

### Option 2: Direct node command

```bash
node backend/import-scholarships.mjs
```

## What the Script Does

1. **Reads** the `scholarships-canada-2026-01-18.json` file
2. **Maps** the JSON fields to Firebase schema:
   - `grant_name` → `name`
   - `field_requirements` → `Requirements` (converted to array)
   - `grant_value` → `Value`
   - `source_url` → `URL`
   - Also includes: `school_name`, `deadline`, `source`, `scrapedAt`
3. **Generates** unique document IDs based on grant name and URL
4. **Imports** all scholarships to the `grants` collection in Firestore
5. **Reports** progress and any errors

## Field Mapping Details

- **Requirements**: Converts string requirements to arrays. If the requirement is "Any", it stores as `['Any']`
- **Document IDs**: Generated from grant name slug + URL ID to ensure uniqueness
- **Duplicates**: If a document with the same ID exists, it will be overwritten

## Expected Output

```
Found 80 scholarships to import
Source: scholarshipscanada.com
Scraped at: 2026-01-18T09:56:24.524Z

Imported 10/80 scholarships...
Imported 20/80 scholarships...
...

=== Import Summary ===
Total scholarships: 80
Successfully imported: 80
Errors: 0

Import completed!
```

## Troubleshooting

- **Module not found errors**: Make sure you're running from the project root directory
- **Firebase connection errors**: Verify your Firebase configuration in `FirebaseConfig.ts` matches your project
- **Permission errors**: Ensure your Firebase project has write permissions enabled

## Notes

- The script uses `setDoc` which will overwrite existing documents with the same ID
- All grants are imported to the `grants` collection
- The script preserves all original data fields for future use
