const { chromium } = require('playwright');

// Test URLs for different types of PubMed articles
const TEST_URLS = [
  'https://pubmed.ncbi.nlm.nih.gov/38699533/', // Human Reprod Open article - your example
  'https://pubmed.ncbi.nlm.nih.gov/37000000/', // Different journal type
  'https://pubmed.ncbi.nlm.nih.gov/36000000/', // Another test case
];

async function extractMetadata(page, url) {
  console.log(`\n🔍 Testing URL: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for page to load completely
    await page.waitForTimeout(2000);
    
    const metadata = await page.evaluate(() => {
      const results = {
        journal: 'Unknown',
        year: new Date().getFullYear(),
        firstAuthor: 'Unknown',
        pmid: 'Unknown',
        methods: {
          journal: [],
          year: [],
          author: [],
          pmid: []
        }
      };
      
      // JOURNAL EXTRACTION - Multiple methods
      console.log('=== JOURNAL EXTRACTION ===');
      
      // Method 1: Meta tag for citation_publisher
      const publisherMeta = document.querySelector('meta[name="citation_publisher"]');
      if (publisherMeta) {
        const content = publisherMeta.getAttribute('content');
        results.methods.journal.push(`Meta citation_publisher: "${content}"`);
        if (results.journal === 'Unknown') {
          results.journal = content;
        }
      }
      
      // Method 2: Meta tag for citation_journal_title
      const journalMeta = document.querySelector('meta[name="citation_journal_title"]');
      if (journalMeta) {
        const content = journalMeta.getAttribute('content');
        results.methods.journal.push(`Meta citation_journal_title: "${content}"`);
        if (results.journal === 'Unknown') {
          results.journal = content;
        }
      }
      
      // Method 3: Journal button text
      const journalButton = document.querySelector('.journal-actions-trigger, button[aria-label*="journal"]');
      if (journalButton) {
        const content = journalButton.textContent.trim();
        results.methods.journal.push(`Journal button: "${content}"`);
        if (results.journal === 'Unknown') {
          results.journal = content;
        }
      }
      
      // Method 4: Look for specific journal patterns in page text
      const bodyText = document.body.textContent;
      const journalPatterns = [
        'Hum Reprod Open',
        'Human Reproduction Open',
        'Nature',
        'Science',
        'Cell',
        'PLOS ONE',
        'BMJ'
      ];
      
      for (const pattern of journalPatterns) {
        if (bodyText.includes(pattern)) {
          results.methods.journal.push(`Page text pattern: "${pattern}"`);
          if (results.journal === 'Unknown') {
            results.journal = pattern;
          }
        }
      }
      
      // YEAR EXTRACTION
      console.log('=== YEAR EXTRACTION ===');
      
      // Method 1: Citation element
      const citationEl = document.querySelector('.cit');
      if (citationEl) {
        const yearMatch = citationEl.textContent.match(/(\d{4})/);
        if (yearMatch) {
          results.methods.year.push(`Citation element: "${yearMatch[1]}"`);
          results.year = yearMatch[1];
        }
      }
      
      // Method 2: Meta tag citation_date
      const dateMeta = document.querySelector('meta[name="citation_date"]');
      if (dateMeta) {
        const content = dateMeta.getAttribute('content');
        const yearMatch = content.match(/(\d{4})/);
        if (yearMatch) {
          results.methods.year.push(`Meta citation_date: "${yearMatch[1]}"`);
          if (results.year === new Date().getFullYear()) {
            results.year = yearMatch[1];
          }
        }
      }
      
      // FIRST AUTHOR EXTRACTION
      console.log('=== AUTHOR EXTRACTION ===');
      
      // Method 1: First author link in authors section
      const authorLink = document.querySelector('.authors a:first-child, .auths a:first-child');
      if (authorLink) {
        const fullName = authorLink.textContent.trim().replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
        const parts = fullName.split(/\s+/);
        if (parts.length > 0) {
          const lastName = parts[parts.length - 1];
          results.methods.author.push(`First author link: "${fullName}" -> "${lastName}"`);
          results.firstAuthor = lastName;
        }
      }
      
      // Method 2: Meta tag citation_author
      const authorMeta = document.querySelector('meta[name="citation_author"]');
      if (authorMeta && results.firstAuthor === 'Unknown') {
        const content = authorMeta.getAttribute('content');
        const parts = content.split(',')[0].trim().split(/\s+/);
        if (parts.length > 0) {
          const lastName = parts[parts.length - 1];
          results.methods.author.push(`Meta citation_author: "${content}" -> "${lastName}"`);
          results.firstAuthor = lastName;
        }
      }
      
      // PMID EXTRACTION
      console.log('=== PMID EXTRACTION ===');
      
      // Method 1: Page text "PMID:" pattern
      const pmidMatch = bodyText.match(/PMID:\s*(\d+)/);
      if (pmidMatch) {
        results.methods.pmid.push(`Page text PMID: "${pmidMatch[1]}"`);
        results.pmid = pmidMatch[1];
      }
      
      // Method 2: URL pathname
      const urlMatch = window.location.pathname.match(/\/(\d+)\/?$/);
      if (urlMatch && results.pmid === 'Unknown') {
        results.methods.pmid.push(`URL pathname: "${urlMatch[1]}"`);
        results.pmid = urlMatch[1];
      }
      
      return results;
    });
    
    // Log detailed results
    console.log('\n📊 EXTRACTION RESULTS:');
    console.log(`Journal: "${metadata.journal}"`);
    console.log(`Year: "${metadata.year}"`);
    console.log(`First Author: "${metadata.firstAuthor}"`);
    console.log(`PMID: "${metadata.pmid}"`);
    
    console.log('\n🔧 METHODS USED:');
    console.log('Journal methods:', metadata.methods.journal);
    console.log('Year methods:', metadata.methods.year);
    console.log('Author methods:', metadata.methods.author);
    console.log('PMID methods:', metadata.methods.pmid);
    
    // Generate filename
    const filename = `${metadata.journal} ${metadata.year} ${metadata.firstAuthor} [SHORT_REF] ${metadata.pmid}.pdf`;
    console.log(`\n📁 Generated filename: "${filename}"`);
    
    return metadata;
    
  } catch (error) {
    console.error(`❌ Error processing ${url}:`, error.message);
    return null;
  }
}

async function testMultipleArticles() {
  console.log('🚀 Starting PubMed Filename Generator Debug Script');
  console.log('================================================');
  
  const browser = await chromium.launch({ 
    headless: false, // Set to true for headless mode
    slowMo: 1000 // Slow down for debugging
  });
  
  const page = await browser.newPage();
  
  // Test each URL
  const results = [];
  for (const url of TEST_URLS) {
    const result = await extractMetadata(page, url);
    if (result) {
      results.push({ url, ...result });
    }
    
    // Take screenshot for debugging
    const urlId = url.split('/').filter(p => p).pop();
    await page.screenshot({ 
      path: `screenshot-${urlId}.png`,
      fullPage: true 
    });
  }
  
  await browser.close();
  
  // Summary
  console.log('\n\n📋 SUMMARY');
  console.log('===========');
  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.url}`);
    console.log(`   Journal: ${result.journal}`);
    console.log(`   Year: ${result.year}`);
    console.log(`   Author: ${result.firstAuthor}`);
    console.log(`   PMID: ${result.pmid}`);
  });
  
  return results;
}

// Interactive mode for single article testing
async function testSingleArticle(url) {
  console.log(`🎯 Testing single article: ${url}`);
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const result = await extractMetadata(page, url);
  
  // Keep browser open for manual inspection
  console.log('\n🔍 Browser kept open for manual inspection...');
  console.log('Press Ctrl+C to close when done.');
  
  // Don't close browser automatically in single test mode
  process.on('SIGINT', async () => {
    await browser.close();
    process.exit();
  });
}

// Main execution
const args = process.argv.slice(2);
if (args.length > 0 && args[0].startsWith('http')) {
  // Test single URL
  testSingleArticle(args[0]);
} else {
  // Test multiple URLs
  testMultipleArticles();
}