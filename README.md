# PubMed Filename Generator

A **bookmarklet** that automatically generates standardized filenames for academic papers from PubMed articles.

## 🎯 Purpose

Solves the common workflow problem where you:
1. Find an article on PubMed
2. Click "Find it at UIC" (or other institutional access)
3. Download PDF
4. **Forget the metadata** by the time you reach the save dialog
5. Have to go back to copy journal name, author, PMID, etc.

## 📁 Generated Filename Format

```
[Journal] [Year] [FirstAuthor] [ShortReference] [PMID].pdf
```

**Examples:**
- `Hum Reprod Open 2024 Jonge Global status male fert 38699533.pdf`
- `Radiol Imaging Cancer 2023 Burkett MRI findings pancreatic 37000000.pdf`
- `J Child Fam Stud 2022 Noel Parent child interaction 36000000.pdf`

## 🚀 Installation

### Method 1: Copy & Bookmark (Recommended)

**IMPORTANT: Use the MINIFIED version without comments!**

1. **Open `bookmarklet-minified.js`** (NOT the regular `bookmarklet.js` file)
2. **Copy the ENTIRE contents** starting with `javascript:` 
3. **Create a new bookmark:**
   - **Chrome/Edge**: Right-click bookmarks bar → "Add page" 
   - **Firefox**: Right-click bookmarks toolbar → "New Bookmark"
   - **Safari**: Bookmarks menu → "Add Bookmark"
4. **Name**: `PubMed Filename Generator`
5. **URL/Location**: Paste the copied code (must start with `javascript:`)
6. **Save**

**⚠️ CRITICAL**: The bookmark URL must be the minified code with NO COMMENTS. Comments will break the bookmarklet!

### Method 2: Drag & Drop

Some browsers support dragging the bookmarklet code directly to your bookmarks bar.

## 📱 Usage

1. **Navigate to any PubMed article** (e.g., `https://pubmed.ncbi.nlm.nih.gov/38699533/`)
2. **Click the bookmarklet** in your bookmarks
3. **Review extracted metadata** - journal, year, author, and PMID are automatically filled
4. **Edit first author if needed** (defaults to last name of first author)
5. **Enter your short reference** (required) - brief description like "Global status male fert"
6. **Click "Copy Filename"** - copies the formatted filename to clipboard
7. **Paste when saving PDF** - use Ctrl/Cmd+V in the file save dialog

## ✅ What It Extracts

- **Journal**: From meta tags (`citation_publisher`, `citation_journal_title`) or journal buttons
- **Year**: From citation elements or meta tags (`citation_date`)
- **First Author**: From author links or meta tags (`citation_author`) - extracts last name
- **PMID**: From page text or URL pathname

## 🧪 Tested With

The bookmarklet has been tested and verified to work with:

- Human Reproduction Open articles
- Radiology Imaging Cancer articles  
- Journal of Child and Family Studies articles
- Multiple other journal formats via meta tag extraction

## 🛠️ Development

This project uses **Playwright for systematic testing** of selector reliability across different PubMed article types.

### Running Tests

```bash
npm install
npm run test
```

This runs the debugging script that:
- Tests extraction methods against multiple PubMed URLs
- Takes screenshots for visual verification
- Logs detailed extraction results for each method
- Verifies selector universality across journal types

### Project Structure

```
├── bookmarklet.js           # Human-readable bookmarklet code (FOR DEVELOPMENT ONLY)
├── bookmarklet-minified.js  # Minified version for actual use (COPY THIS ONE!)
├── pubmed-extractor.js      # Playwright debugging script
├── test-urls.txt           # Test URLs for validation
└── package.json            # Dependencies (Playwright)
```

### File Usage Guide

- **`bookmarklet.js`** - Human-readable version with comments. DO NOT use for bookmarking.
- **`bookmarklet-minified.js`** - This is the version you copy and paste into your bookmark. No comments, starts with `javascript:`

## 🔍 Technical Details

### Extraction Strategy

The bookmarklet uses multiple fallback methods for reliability:

**Journal Detection:**
1. `meta[name="citation_publisher"]` - most reliable
2. `meta[name="citation_journal_title"]` - backup  
3. `.journal-actions-trigger` button text - fallback
4. Specific journal name patterns in page text

**Year Detection:**
1. `.cit` element text with year regex - primary
2. `meta[name="citation_date"]` - backup

**Author Detection:**
1. `.authors a:first-child` - first author link
2. `meta[name="citation_author"]` - meta tag fallback

**PMID Detection:**
1. Page text `PMID: \\d+` pattern - most reliable
2. URL pathname `/\\d+/` extraction - backup

### Browser Compatibility

- ✅ Chrome/Chromium
- ✅ Firefox  
- ✅ Safari
- ✅ Edge
- Handles clipboard API limitations gracefully
- Uses fallback methods for older browsers

## 🐛 Troubleshooting

**"Could not extract required metadata" error:**
- Ensure you're on a PubMed article page (`pubmed.ncbi.nlm.nih.gov`)
- Some very old articles may have different page structures
- Check browser console for detailed extraction logs

**Clipboard not working:**
- Some browsers block clipboard access for bookmarklets
- The bookmarklet will fallback to text selection + Ctrl+C method
- Manual copy from the text area always works

**Variable conflicts on repeated use:**
- The bookmarklet prevents conflicts by removing previous dialogs
- Safe to run multiple times on the same page

## 📝 License

MIT License - feel free to modify and distribute.