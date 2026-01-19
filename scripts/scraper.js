import dotenv from "dotenv";
import { writeFile } from "fs/promises";
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

// Scrape URL using ScrapingBee API
async function scrapeWithScrapingBee(url, options = {}) {
  const apiKey = process.env.SCRAPING_BEE_KEY;

  const params = new URLSearchParams({
    api_key: apiKey,
    url: url,
    render_js: "true",
    wait: "10000", // Wait 10 seconds for JavaScript to fully render
    wait_for: ".Table-Standard-AwardName", // Wait for scholarship table rows to appear
    premium_proxy: "true", // Use premium proxy to bypass Cloudflare
    block_resources: "false", // Don't block resources to avoid detection
    country_code: "us", // Set country for proxy
  });

  // Add optional parameters
  if (options.stealth) {
    params.set("stealth_proxy", "true"); // Use stealth proxy for heavy protection (75 credits)
    params.delete("premium_proxy"); // Can't use both
  }

  const apiUrl = `https://app.scrapingbee.com/api/v1/?${params.toString()}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    const errorText = await response.text();
    
    // If premium proxy failed, try stealth proxy
    if (!options.stealth && (errorText.includes("403") || errorText.includes("500"))) {
      return scrapeWithScrapingBee(url, { stealth: true });
    }
    
    throw new Error(`ScrapingBee API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const html = await response.text();
  return html;
}

// Extract only scholarship table rows and cells from HTML
function extractScholarshipTableRows(html) {
  // Find the start of the scholarship table
  const tableStartIndex = html.indexOf('Table-Standard-AwardName');
  if (tableStartIndex === -1) {
    return [];
  }
  
  // Find the table element that contains the scholarships
  let tableStart = html.lastIndexOf('<table', tableStartIndex);
  if (tableStart === -1) {
    tableStart = html.lastIndexOf('<tbody', tableStartIndex);
    if (tableStart === -1) {
      tableStart = html.lastIndexOf('<tr', tableStartIndex);
    }
  }
  
  // Extract all rows that contain scholarship data
  const rows = [];
  let searchIndex = tableStart;
  
  while (true) {
    const trStart = html.indexOf('<tr', searchIndex);
    if (trStart === -1) break;
    
    let trEnd = html.indexOf('</tr>', trStart);
    if (trEnd === -1) break;
    trEnd += 5;
    
    const rowContent = html.substring(trStart, trEnd);
    
    // Check if this row contains scholarship data (exclude header row)
    if ((rowContent.includes('Table-Standard-AwardName') || 
         rowContent.includes('Table-Standard-Amount') || 
         rowContent.includes('Table-Standard-Deadline')) &&
        !rowContent.includes('<th')) {
      rows.push(rowContent);
    }
    
    searchIndex = trEnd;
  }
  
  return rows;
}

// Find pagination links in HTML
function findPaginationLinks(html) {
  const links = [];
  // Look for pagination controls - common patterns
  const patterns = [
    /href="([^"]*__doPostBack[^"]*Page[^"]*)"[^>]*>(\d+)</gi,
    /href="([^"]*PageIndex[^"]*)"[^>]*>(\d+)</gi,
    /href="([^"]*page[^"]*)"[^>]*>(\d+)</gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      links.push({ url: match[1], page: parseInt(match[2]) });
    }
  }
  
  return links;
}

// Scrape a single page and return the rows
async function scrapePage(url, pageNumber = 1) {
  let pageUrl = url;
  
  if (pageNumber > 1) {
    // Try different pagination URL patterns
    const urlObj = new URL(url);
    
    // Try common ASP.NET pagination patterns
    const patterns = [
      () => { urlObj.searchParams.set('PageIndex', pageNumber - 1); },
      () => { urlObj.searchParams.set('page', pageNumber); },
      () => { urlObj.searchParams.set('Page', pageNumber); },
      () => { urlObj.searchParams.set('p', pageNumber); },
    ];
    
    // Try the first pattern (most common for ASP.NET)
    patterns[0]();
    pageUrl = urlObj.toString();
  }
  
  let html;
  try {
    html = await scrapeWithScrapingBee(pageUrl, { stealth: true });
    if (!html.includes('Table-Standard-AwardName') && html.length <= 50000) {
      throw new Error("Got HTML but no scholarship table data");
    }
  } catch (error) {
    html = await scrapeWithScrapingBee(pageUrl);
    if (!html.includes('Table-Standard-AwardName') && html.length <= 50000) {
      throw new Error("Got HTML but no scholarship table data");
    }
  }
  
  return { rows: extractScholarshipTableRows(html), html };
}

// Main function
async function main() {
  const baseUrl = "https://www.scholarshipscanada.com/Scholarships/ScholarshipSearch.aspx?type=ScholarshipName&s=";
  const timestamp = new Date().toISOString().split("T")[0];
  const htmlPath = join(__dirname, `scholarships-canada-${timestamp}.html`);
  const targetCount = 100;
  
  try {
    const allRows = [];
    let pageNumber = 1;
    let hasMorePages = true;
    let paginationLinks = null;
    
    // Scrape pages until we have enough scholarships
    while (allRows.length < targetCount && hasMorePages) {
      const result = await scrapePage(baseUrl, pageNumber);
      const rows = result.rows;
      
      if (rows.length === 0) {
        // No more rows found, stop pagination
        hasMorePages = false;
        break;
      }
      
      allRows.push(...rows);
      
      // On first page, try to find pagination links
      if (pageNumber === 1 && !paginationLinks) {
        paginationLinks = findPaginationLinks(result.html);
      }
      
      pageNumber++;
      
      // Limit to reasonable number of pages (safety check)
      if (pageNumber > 15) {
        break;
      }
      
      // Small delay between pages to avoid rate limiting
      if (allRows.length < targetCount) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (allRows.length === 0) {
      throw new Error("Failed to extract any scholarship table rows");
    }
    
    // Combine all rows into a simple HTML table structure
    const extractedHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Scholarship Data</title>
</head>
<body>
  <table>
    ${allRows.join("\n")}
  </table>
</body>
</html>`;
    
    // Save extracted HTML
    await writeFile(htmlPath, extractedHTML, "utf-8");
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main().catch(console.error);

export { scrapeWithScrapingBee };

