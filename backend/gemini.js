import dotenv from "dotenv";
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../.env");
const envPathBackend = join(__dirname, ".env");

const result = dotenv.config({ path: envPath });
if (result.error) {
  dotenv.config({ path: envPathBackend });
}

// Extract scholarship data from HTML using Gemini API
async function extractScholarshipsWithGemini(html) {
  // Get API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GEMINIKEY not found in environment variables");
  }

  // Prompt for Gemini to extract scholarship data
  const prompt = `Extract all scholarship information from this HTML table and return it as a JSON array.

Each scholarship is in a table row (<tr>) with:
- Grant name: Found in <a class="bold"> tag within <td class="Table-Standard-AwardName">
- School name: Found after <span>School:</span> (can be "Any" or a school name)
- Field of study: Found after <span>Field of Study:</span> (can be "Any" or specific fields)
- Grant value: Found in <span id="...lblScholarshipValueDisplay"> (can be "$X,XXX" or "n/s")
- Deadline: Found in <span id="...lblScholarshipDeadlineDisplay"> (date format like "January 19, 2026")
- Source URL: Found in the href attribute of the grant name <a> tag (make relative URLs absolute: https://www.scholarshipscanada.com)

For each scholarship, return an object with these exact keys:
- grant_name: The full name of the scholarship
- school_name: The school name or "Any"
- field_requirements: The field(s) of study (array if multiple, or single string)
- grant_value: The dollar amount (keep "$X,XXX" format or "n/s")
- deadline: The deadline date
- source_url: The full URL to the scholarship detail page

Return ONLY a valid JSON array. Use "n/a" for missing data. Do not include any explanatory text, only the JSON array.`;

  // Build Gemini API URL with model name
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
  
  // Limit HTML size to avoid token limits
  const htmlSubstring = html.substring(0, 1000000);
  
  // Call Gemini API
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${prompt}\n\nHTML:\n${htmlSubstring}`
        }]
      }]
    }),
  });

  // Parse response and extract JSON array
  const data = await response.json();
  const extractedText = data.candidates[0].content.parts[0].text;
  
  // Find JSON array in response text
  const jsonMatch = extractedText.match(/\[[\s\S]*\]/);

  // Parse and return scholarships
  const scholarships = JSON.parse(jsonMatch[0]);
  return scholarships;
}

// Main function - converts HTML to JSON
async function main() {
  const htmlPath = join(__dirname, "scholarships-canada-2026-01-18.html");
  const jsonPath = join(__dirname, "scholarships-canada-2026-01-18.json");

  try {
    // Read HTML file
    const html = await readFile(htmlPath, "utf-8");
    
    // Extract scholarships using Gemini
    const scholarships = await extractScholarshipsWithGemini(html);
    
    // Create output object with metadata
    const output = {
      scrapedAt: new Date().toISOString(),
      totalScholarships: scholarships.length,
      source: "scholarshipscanada.com",
      scholarships: scholarships,
    };
    
    // Save to JSON file
    await writeFile(jsonPath, JSON.stringify(output, null, 2), "utf-8");
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main().catch(console.error);

export { extractScholarshipsWithGemini };

