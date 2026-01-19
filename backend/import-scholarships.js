// Import script for scholarships-canada JSON to Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration (same as FirebaseConfig.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBpVcOUQ9wOkj1gqKtKHLzNqUdOPoYv3Wg",
  authDomain: "grantify-9c488.firebaseapp.com",
  projectId: "grantify-9c488",
  storageBucket: "grantify-9c488.firebasestorage.app",
  messagingSenderId: "594586262879",
  appId: "1:594586262879:web:fbd7f97ffedea6f9782aea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to convert field_requirements to array
function normalizeRequirements(fieldRequirements) {
  if (Array.isArray(fieldRequirements)) {
    return fieldRequirements;
  } else if (typeof fieldRequirements === 'string') {
    // If it's "Any", return empty array or array with "Any"
    if (fieldRequirements.toLowerCase() === 'any') {
      return ['Any'];
    }
    return [fieldRequirements];
  }
  return ['Not specified'];
}

// Function to generate a unique document ID from grant name and URL
function generateDocId(grantName, sourceUrl) {
  // Use a combination of grant name and URL hash
  const nameSlug = grantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  // Extract ID from URL if available
  const urlMatch = sourceUrl?.match(/\/(\d+)\//);
  const urlId = urlMatch ? urlMatch[1] : '';
  
  return `${nameSlug}-${urlId}`.substring(0, 100);
}

async function importScholarships() {
  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, 'scholarships-canada-2026-01-18.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`Found ${jsonData.scholarships.length} scholarships to import`);
    console.log(`Source: ${jsonData.source}`);
    console.log(`Scraped at: ${jsonData.scrapedAt}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Import each scholarship
    for (let i = 0; i < jsonData.scholarships.length; i++) {
      const scholarship = jsonData.scholarships[i];
      
      try {
        // Map JSON fields to Firebase schema
        const grantData = {
          name: scholarship.grant_name || 'Unknown Grant',
          Requirements: normalizeRequirements(scholarship.field_requirements),
          Value: scholarship.grant_value || 'N/A',
          URL: scholarship.source_url || '',
          // Additional fields that might be useful
          school_name: scholarship.school_name || '',
          deadline: scholarship.deadline || '',
          source: jsonData.source || 'scholarshipscanada.com',
          scrapedAt: jsonData.scrapedAt || new Date().toISOString(),
        };
        
        // Generate document ID
        const docId = generateDocId(grantData.name, grantData.URL);
        
        // Use setDoc to avoid duplicates (will overwrite if exists)
        await setDoc(doc(db, 'grants', docId), grantData);
        
        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`Imported ${i + 1}/${jsonData.scholarships.length} scholarships...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          index: i,
          grant_name: scholarship.grant_name,
          error: error.message
        });
        console.error(`Error importing scholarship ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(`Total scholarships: ${jsonData.scholarships.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach(err => {
        console.log(`Index ${err.index} (${err.grant_name}): ${err.error}`);
      });
    }
    
    console.log('\nImport completed!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importScholarships();
}

module.exports = { importScholarships };
