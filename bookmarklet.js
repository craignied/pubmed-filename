// PubMed Filename Generator Bookmarklet - DEVELOPMENT VERSION
// 
// ⚠️  WARNING: DO NOT USE THIS FILE FOR BOOKMARKING! ⚠️
// This file contains comments that will break the bookmarklet.
// Use "bookmarklet-minified.js" instead for actual bookmarking.
//
// This human-readable version is for development and understanding only.

(function() {
  'use strict';
  
  console.log('🔍 Starting PubMed Filename Generator...');
  
  // Prevent conflicts on repeated execution
  const existingDialog = document.getElementById('pubmed-filename-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }
  
  // JOURNAL EXTRACTION - Multiple fallback methods
  let journal = 'Unknown';
  
  // Method 1: Meta tag citation_publisher (most reliable)
  const publisherMeta = document.querySelector('meta[name="citation_publisher"]');
  if (publisherMeta && journal === 'Unknown') {
    journal = publisherMeta.getAttribute('content');
    console.log('📰 Journal found via citation_publisher meta:', journal);
  }
  
  // Method 2: Meta tag citation_journal_title
  const journalMeta = document.querySelector('meta[name="citation_journal_title"]');
  if (journalMeta && journal === 'Unknown') {
    journal = journalMeta.getAttribute('content');
    console.log('📰 Journal found via citation_journal_title meta:', journal);
  }
  
  // Method 3: Journal button text
  const journalButton = document.querySelector('.journal-actions-trigger, button[aria-label*="journal"]');
  if (journalButton && journal === 'Unknown') {
    journal = journalButton.textContent.trim();
    console.log('📰 Journal found via journal button:', journal);
  }
  
  // YEAR EXTRACTION
  let year = new Date().getFullYear();
  
  // Method 1: Citation element (most common)
  const citationEl = document.querySelector('.cit');
  if (citationEl) {
    const yearMatch = citationEl.textContent.match(/(\\d{4})/);
    if (yearMatch) {
      year = yearMatch[1];
      console.log('📅 Year found via citation element:', year);
    }
  }
  
  // Method 2: Meta tag citation_date (fallback)
  if (year === new Date().getFullYear()) {
    const dateMeta = document.querySelector('meta[name="citation_date"]');
    if (dateMeta) {
      const yearMatch = dateMeta.getAttribute('content').match(/(\\d{4})/);
      if (yearMatch) {
        year = yearMatch[1];
        console.log('📅 Year found via citation_date meta:', year);
      }
    }
  }
  
  // FIRST AUTHOR EXTRACTION  
  let firstAuthor = 'Unknown';
  
  // Method 1: First author link in authors section
  const authorLink = document.querySelector('.authors a:first-child, .auths a:first-child');
  if (authorLink) {
    const fullName = authorLink.textContent.trim().replace(/\\d+/g, '').replace(/\\s+/g, ' ').trim();
    const parts = fullName.split(/\\s+/);
    if (parts.length > 0) {
      firstAuthor = parts[parts.length - 1]; // Last name
      console.log('👤 First author found via author link:', fullName, '->', firstAuthor);
    }
  }
  
  // Method 2: Meta tag citation_author (fallback)
  if (firstAuthor === 'Unknown') {
    const authorMeta = document.querySelector('meta[name="citation_author"]');
    if (authorMeta) {
      const content = authorMeta.getAttribute('content');
      const parts = content.split(',')[0].trim().split(/\\s+/);
      if (parts.length > 0) {
        firstAuthor = parts[parts.length - 1];
        console.log('👤 First author found via citation_author meta:', content, '->', firstAuthor);
      }
    }
  }
  
  // PMID EXTRACTION
  let pmid = 'Unknown';
  
  // Method 1: Page text "PMID:" pattern
  const bodyText = document.body.textContent;
  const pmidMatch = bodyText.match(/PMID:\\s*(\\d+)/);
  if (pmidMatch) {
    pmid = pmidMatch[1];
    console.log('🔢 PMID found via page text:', pmid);
  }
  
  // Method 2: URL pathname (fallback)
  if (pmid === 'Unknown') {
    const urlMatch = window.location.pathname.match(/\\/(\\d+)\\/?$/);
    if (urlMatch) {
      pmid = urlMatch[1];
      console.log('🔢 PMID found via URL pathname:', pmid);
    }
  }
  
  // Validation
  if (journal === 'Unknown' || pmid === 'Unknown') {
    alert('❌ Could not extract required metadata from this PubMed page.\\n\\nJournal: ' + journal + '\\nPMID: ' + pmid);
    return;
  }
  
  console.log('✅ Extraction complete:', {journal, year, firstAuthor, pmid});
  
  // Create styled dialog for user input
  const dialog = document.createElement('div');
  dialog.id = 'pubmed-filename-dialog';
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #007cba;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    min-width: 400px;
    max-width: 600px;
    padding: 24px;
  `;
  
  // Build dialog content
  dialog.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #007cba; font-size: 18px;">📁 PubMed Filename Generator</h3>
      <p style="margin: 0; color: #666; font-size: 14px;">Review and customize your filename:</p>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #333;">Journal:</label>
      <input type="text" id="journal-input" value="${journal}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" readonly>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #333;">Year:</label>
      <input type="text" id="year-input" value="${year}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" readonly>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #333;">First Author (editable):</label>
      <input type="text" id="author-input" value="${firstAuthor}" style="width: 100%; padding: 8px; border: 1px solid #007cba; border-radius: 4px; font-size: 14px;">
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #333;">Short Reference <span style="color: #e74c3c;">*</span>:</label>
      <div style="position: relative;">
        <input type="text" id="ref-input" placeholder="e.g. Global status male fert" style="width: 100%; padding: 8px 28px 8px 8px; border: 1px solid #007cba; border-radius: 4px; font-size: 14px; box-sizing: border-box;">
        <span id="ref-clear" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #999; font-size: 16px; line-height: 1; display: none; user-select: none;" title="Clear">&times;</span>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #333;">PMID:</label>
      <input type="text" id="pmid-input" value="${pmid}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" readonly>
    </div>
    
    <div style="margin-bottom: 20px; padding: 12px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
      <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Generated Filename:</label>
      <textarea id="filename-preview" readonly style="width: 100%; height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; font-family: monospace; background: white; resize: none;"></textarea>
    </div>
    
    <div style="text-align: right;">
      <button id="cancel-btn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px; font-size: 14px;">Cancel</button>
      <button id="copy-btn" style="background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">📋 Copy Filename</button>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Get form elements
  const authorInput = document.getElementById('author-input');
  const refInput = document.getElementById('ref-input');
  const filenamePreview = document.getElementById('filename-preview');
  const copyBtn = document.getElementById('copy-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  // Update filename preview
  function updatePreview() {
    const author = authorInput.value.trim() || firstAuthor;
    const ref = refInput.value.trim();
    if (ref) {
      const filename = `${journal} ${year} ${author} ${ref} ${pmid}.pdf`;
      filenamePreview.value = filename;
      copyBtn.disabled = false;
      copyBtn.style.opacity = '1';
    } else {
      filenamePreview.value = `${journal} ${year} ${author} [SHORT_REF] ${pmid}.pdf`;
      copyBtn.disabled = true;
      copyBtn.style.opacity = '0.5';
    }
  }
  
  // Clear button for ref input
  const refClear = document.getElementById('ref-clear');

  function toggleClearBtn() {
    refClear.style.display = refInput.value ? 'block' : 'none';
  }

  refClear.addEventListener('click', function() {
    refInput.value = '';
    toggleClearBtn();
    updatePreview();
    refInput.focus();
  });

  // Event listeners
  authorInput.addEventListener('input', updatePreview);
  refInput.addEventListener('input', function() { toggleClearBtn(); updatePreview(); });
  
  // Copy to clipboard
  copyBtn.addEventListener('click', function() {
    const filename = filenamePreview.value;
    
    // Try modern clipboard API first
    if (navigator.clipboard) {
      navigator.clipboard.writeText(filename).then(() => {
        alert('✅ Filename copied to clipboard!\\n\\n' + filename);
        dialog.remove();
      }).catch(() => {
        // Fallback to selection method
        filenamePreview.select();
        document.execCommand('copy');
        alert('✅ Filename copied to clipboard!\\n\\n' + filename);
        dialog.remove();
      });
    } else {
      // Fallback for older browsers
      filenamePreview.select();
      document.execCommand('copy');
      alert('✅ Filename copied to clipboard!\\n\\n' + filename);
      dialog.remove();
    }
  });
  
  // Cancel button
  cancelBtn.addEventListener('click', function() {
    dialog.remove();
  });
  
  // Enter key to copy (when ref is filled)
  refInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && refInput.value.trim()) {
      copyBtn.click();
    }
  });
  
  // Initialize preview and focus
  updatePreview();
  refInput.focus();
  
})();