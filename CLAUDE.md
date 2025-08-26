# PubMed Filename Generator

## Project Goal

Create a **bookmarklet** that automatically generates standardized filenames for academic papers downloaded from PubMed.

### Target Filename Format
```
[Journal] [Year] [FirstAuthor] [ShortReference] [PMID].pdf
```

**Example:**
```
Hum Reprod Open 2024 Jonge Global status male fert 38699533.pdf
```

## Current Workflow Problem

The user currently follows this workflow:
1. Find article on PubMed
2. Click "Find it at UIC" 
3. Download PDF
4. **Manual filename entry** - by the time they reach the save dialog, they've forgotten the metadata and have to go back to copy journal name, author, PMID, etc.

## Desired Solution

A **bookmarklet** that:
- Runs with one click on any PubMed article page
- Automatically extracts: journal abbreviation, year, first author, PMID
- Prompts user for: short reference description
- Copies the formatted filename to clipboard
- User can then paste when saving the PDF

## Technical Requirements

### Data Extraction Targets
- **Journal**: Extract from `<meta name="citation_publisher" content="...">` (preferred) or journal button text
- **Year**: Extract from `.cit` element text matching `(\d{4})` pattern
- **First Author**: Extract last name from `.authors a:first-child` element  
- **PMID**: Extract from page text matching `PMID:\s*(\d+)` pattern
- **User Input**: Short reference description

### Browser Compatibility
- Must work as a bookmarklet (javascript: URL)
- Handle clipboard API limitations gracefully
- Avoid variable declaration conflicts on repeated use

## Challenges Encountered

1. **Browser Security**: Some browsers block `javascript:` URLs in bookmarks
2. **Variable Conflicts**: Console variable redeclaration errors when testing
3. **Clipboard Permissions**: Browser clipboard API restrictions
4. **DOM Selector Reliability**: Need robust selectors that work across different PubMed article layouts

## Development Approach: Use Playwright for Debugging

### Why Playwright?

**Problems with console development:**
- Browser security blocking bookmarklets
- Variable declaration conflicts
- Limited debugging visibility
- Manual testing on live pages

**Playwright advantages:**
- Clean environment each run
- Systematic selector testing
- Screenshot debugging capabilities  
- Test multiple PubMed articles automatically
- Handle dynamic content loading
- Develop interactively with UI injection

### Development Steps

1. **Debug with Playwright first**
   - Test data extraction selectors against live PubMed pages
   - Verify universality across different articles
   - Handle edge cases and fallback methods
   - Screenshot debugging for visual verification

2. **Convert to bookmarklet**
   - Once selectors are proven reliable in Playwright
   - Wrap in IIFE to avoid variable conflicts
   - Add clipboard fallback methods
   - Test final bookmarklet across browsers

### Playwright Development Script

Create `pubmed-extractor.js` that:
- Tests all metadata extraction methods
- Logs detailed debugging information
- Takes screenshots for visual debugging
- Tests multiple article URLs for universality
- Provides interactive UI for real-world testing

## Success Criteria

- **One-click operation**: Single bookmark click extracts all metadata
- **Universal compatibility**: Works across different PubMed article types
- **Reliable extraction**: Consistently finds journal, year, author, PMID
- **User-friendly**: Simple prompt for short reference, clear success feedback
- **Cross-browser**: Functions in Chrome, Firefox, Safari, Edge

## File Structure

```
pubmed-filename-generator/
├── CLAUDE.md                 # This documentation
├── bookmarklet.js            # Final bookmarklet code
├── pubmed-extractor.js       # Playwright development/debugging script  
├── test-urls.txt            # List of PubMed URLs for testing
└── package.json             # Playwright dependency
```

## Next Steps

1. Set up Playwright environment (`npm install playwright`)
2. Run debugging script against target PubMed article
3. Test selector reliability across multiple articles
4. Refine extraction logic based on test results
5. Convert proven logic to bookmarklet format
6. Final cross-browser testing

The Playwright approach allows systematic development and debugging before committing to the bookmarklet format, ensuring a more reliable final product.