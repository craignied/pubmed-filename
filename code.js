// Simple PubMed Filename Generator - Fixed variable conflicts
// Paste this into browser console on PubMed article page

(function(){
  console.log('Starting simple PubMed filename generator...');
  
  // Extract journal from meta tags first, then fallback methods
  var journal = 'Unknown';
  
  // Method 1: Meta tag for citation_publisher
  const publisherMeta = document.querySelector('meta[name="citation_publisher"]');
  if (publisherMeta) {
    journal = publisherMeta.getAttribute('content');
    console.log('Journal found in meta tag:', journal);
  }
  
  // Method 2: Journal button text 
  if (journal === 'Unknown') {
    const journalButton = document.querySelector('.journal-actions-trigger, button[aria-label*="journal"]');
    if (journalButton) {
      journal = journalButton.textContent.trim();
      console.log('Journal found in button:', journal);
    }
  }
  
  // Method 3: Look for "Hum Reprod Open" specifically in page text
  if (journal === 'Unknown') {
    if (document.body.textContent.includes('Hum Reprod Open')) {
      journal = 'Hum Reprod Open';
      console.log('Found "Hum Reprod Open" in page text');
    }
  }
  
  console.log('Final journal extracted:', journal);
  
  // Extract year from citation or URL
  var year = new Date().getFullYear();
  const citationEl = document.querySelector('.cit');
  if (citationEl) {
    const yearMatch = citationEl.textContent.match(/(\d{4})/);
    if (yearMatch) {
      year = yearMatch[1];
    }
  }
  console.log('Year found:', year);
  
  // Extract first author
  var firstAuthor = 'Unknown';
  const authorLink = document.querySelector('.authors a:first-child, .auths a:first-child, a[data-ga-label*="De Jonge"], a[href*="author"]');
  if (authorLink) {
    const fullName = authorLink.textContent.trim().replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
    const parts = fullName.split(/\s+/);
    if (parts.length > 0) {
      firstAuthor = parts[parts.length - 1];
    }
  }
  console.log('First author found:', firstAuthor);
  
  // Extract PMID
  var pmid = 'Unknown';
  const pmidMatch = document.body.textContent.match(/PMID:\s*(\d+)/) ||
                   window.location.pathname.match(/\/(\d+)\/?$/);
  if (pmidMatch) {
    pmid = pmidMatch[1];
  }
  console.log('PMID found:', pmid);
  
  // Get user inputs - skip journal input since we found it automatically
  const author = prompt(`First author (edit if needed):`, firstAuthor);
  if (author === null) {
    console.log('Author input cancelled');
    return;
  }
  
  const shortRef = prompt('Enter your short reference:', '');
  if (!shortRef || shortRef.trim() === '') {
    console.log('No short reference provided, cancelled');
    return;
  }
  
  // Generate filename
  const filename = `${journal} ${year} ${author || firstAuthor} ${shortRef.trim()} ${pmid}.pdf`;
  console.log('Generated filename:', filename);
  
  // Create a text box with the filename for easy copying
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: white;
    border: 2px solid #007cba;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 400px;
  `;
  
  resultDiv.innerHTML = `
    <div style="margin-bottom: 10px; font-weight: bold; color: #007cba;">📁 Your Filename:</div>
    <textarea id="filename-text" style="width: 100%; height: 60px; font-size: 12px; border: 1px solid #ccc; padding: 5px;" readonly>${filename}</textarea>
    <div style="margin-top: 10px;">
      <button onclick="document.getElementById('filename-text').select(); document.execCommand('copy'); alert('Copied!');" 
              style="background: #007cba; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Copy</button>
      <button onclick="this.parentElement.parentElement.remove();" 
              style="background: #666; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  document.body.appendChild(resultDiv);
  
  // Auto-select the text
  setTimeout(() => {
    document.getElementById('filename-text').select();
  }, 100);
  
  console.log('Filename box created. Click Copy button or manually copy the selected text.');
})();