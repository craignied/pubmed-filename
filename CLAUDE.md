# PubMed Filename Generator

## Project Goal

Generate standardized filenames for academic papers downloaded from PubMed, using **two complementary tools**:

1. **Browser Bookmarklet** - extracts metadata from PubMed pages, copies filename to clipboard
2. **PMID Renamer Mac App** - renames downloaded PDF files by fetching metadata from PubMed API

### Target Filename Format
```
[Journal] [Year] [FirstAuthor] [ShortReference] [PMID].pdf
```

**Example:**
```
Hum Reprod Open 2024 Jonge Global status male fert 38699533.pdf
```

## Workflow

1. Find article on PubMed
2. Click bookmarklet to copy filename to clipboard (optional)
3. Click "Find it at UIC" and download PDF
4. Either paste the filename from clipboard, or use PMID Renamer app to rename the file

## File Structure

```
pubmed/
├── CLAUDE.md                    # This documentation
├── README.md                    # User documentation
├── package.json                 # Dependencies (Playwright for testing)
│
├── bookmarklet.js               # Human-readable bookmarklet (DEVELOPMENT ONLY)
├── bookmarklet-minified.js      # Final bookmarklet for actual use (COPY THIS ONE!)
├── pubmed-extractor.js          # Playwright development/debugging script
├── test-urls.txt                # List of PubMed URLs for testing
│
├── pmidlabel_gui_enhanced.py    # PMID Renamer GUI app source (primary)
├── pmidlabel.py                 # PMID Renamer CLI version
│
└── pmidlabel-app/               # Mac .app bundle build resources
    ├── create_mac_app.sh        # Script to build the .app bundle
    ├── create_icon.py           # Icon generator script
    ├── AppIcon.icns             # App icon file
    ├── AppIcon.iconset/         # Icon source images
    ├── CLAUDE.md                # Legacy app-specific docs
    ├── README_GUI.md            # GUI documentation
    └── QUICKSTART.md            # Quick reference
```

## Tool 1: Browser Bookmarklet

### How It Works
- Runs on any PubMed article page with one click
- Scrapes metadata from the page DOM (meta tags, citation elements)
- Shows a dialog to review extracted data and enter a short description
- Copies the formatted filename to clipboard

### CRITICAL: Which File to Use
- **bookmarklet.js** - Development version with comments. DO NOT bookmark this.
- **bookmarklet-minified.js** - Minified version. COPY THIS ONE for bookmarking.

### Data Extraction (DOM scraping)
- **Journal**: `meta[name="citation_publisher"]` or `meta[name="citation_journal_title"]`
- **Year**: `.cit` element text or `meta[name="citation_date"]`
- **First Author**: `.authors a:first-child` or `meta[name="citation_author"]`
- **PMID**: Page text `PMID:\s*(\d+)` or URL pathname

### UI Features
- Editable author field
- Short reference input with clear (x) button
- Live filename preview
- Enter key to copy, Cancel to dismiss

## Tool 2: PMID Renamer Mac App

### How It Works
- Native macOS Python/Tkinter GUI app
- User types a description, then either drags PDFs onto the window or clicks "Select PDF Files"
- Reads the PMID from the PDF filename (expects files named like `38699533.pdf`)
- Fetches metadata from PubMed E-utilities API (MEDLINE format)
- Renames the actual file in place

### Data Extraction (PubMed API)
- **Endpoint**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`
- **Journal**: `TA` field (journal abbreviation)
- **Year**: `DP` field (publication date)
- **First Author**: First `AU` field (author last name)

### UI Features
- Description text field with clear (x) button
- "Select PDF Files" button
- Drag-and-drop onto window (requires tkinterdnd2)
- Silent operation with system beep on completion

### Building the App
```bash
cd pmidlabel-app
bash create_mac_app.sh
```
This builds `PMID Renamer.app` to `/Applications` by default. Use `-d <path>` to override.

### Dependencies
- Python 3.11 (Homebrew preferred, avoids tkinterdnd2 issues with 3.13)
- `requests` - PubMed API calls
- `tkinterdnd2` - drag-and-drop support (optional, degrades gracefully)

### Python Interpreter Notes
- Avoid Xcode's Python 3.9 (crashes on macOS Sequoia)
- Python 3.13 has tkinterdnd2 incompatibility
- `launcher.sh` in the app bundle auto-detects the right Python

## Development

### Bookmarklet Development
Use Playwright for systematic testing:
```bash
npm install
npm run test
```

### Rebuilding the Mac App
After editing `pmidlabel_gui_enhanced.py`:
```bash
cd pmidlabel-app && bash create_mac_app.sh
```

### Testing the CLI Version
```bash
python3 pmidlabel.py 40237684 "Core outcomes male infert"
```
