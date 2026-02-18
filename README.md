# PubMed Filename Generator

Two tools for generating standardized filenames for academic papers from PubMed:

1. **Browser Bookmarklet** - scrapes metadata from PubMed pages, copies filename to clipboard
2. **PMID Renamer Mac App** - renames downloaded PDFs by fetching metadata from PubMed API

## Generated Filename Format

```
[Journal] [Year] [FirstAuthor] [ShortReference] [PMID].pdf
```

**Examples:**
- `Hum Reprod Open 2024 Jonge Global status male fert 38699533.pdf`
- `Fertil Steril 2025 Rimmer Core outcomes male infert 40237684.pdf`

---

## Bookmarklet

A browser bookmarklet that runs on any PubMed article page.

### Installation

1. Open `bookmarklet-minified.js` (NOT `bookmarklet.js`)
2. Copy the entire contents starting with `javascript:`
3. Create a new bookmark in your browser and paste the code as the URL

**Do not use `bookmarklet.js`** - it contains comments that break bookmarklets.

### Usage

1. Navigate to a PubMed article (e.g., `https://pubmed.ncbi.nlm.nih.gov/38699533/`)
2. Click the bookmarklet
3. Review the extracted metadata (journal, year, author, PMID)
4. Enter a short reference description
5. Click "Copy Filename" (or press Enter)
6. Paste when saving the PDF

### What It Extracts

| Field | Primary Source | Fallback |
|-------|---------------|----------|
| Journal | `meta[name="citation_publisher"]` | `meta[name="citation_journal_title"]` |
| Year | `.cit` element text | `meta[name="citation_date"]` |
| First Author | `.authors a:first-child` | `meta[name="citation_author"]` |
| PMID | Page text `PMID: \d+` | URL pathname |

### Browser Compatibility

Works in Chrome, Firefox, Safari, and Edge. Handles clipboard API limitations with fallback methods.

---

## PMID Renamer Mac App

A native macOS app (Python/Tkinter) that renames PDF files based on PubMed metadata.

### How It Works

1. Download a PDF named with its PMID (e.g., `40237684.pdf`)
2. Open PMID Renamer
3. Type a short description
4. Either drag the PDF onto the window or click "Select PDF Files"
5. The file is renamed in place (e.g., `Fertil Steril 2025 Rimmer Core outcomes male infert 40237684.pdf`)

### Building the App

```bash
cd pmidlabel-app
bash create_mac_app.sh
```

Builds to `/Applications/PMID Renamer.app` by default. Override with `-d <path>`.

### Dependencies

```bash
# Python 3.11 recommended (3.13 has tkinterdnd2 issues)
brew install python@3.11 python-tk@3.11
/opt/homebrew/bin/python3.11 -m pip install requests tkinterdnd2
```

### CLI Version

```bash
python3 pmidlabel.py <PMID> "<description>"
# Example:
python3 pmidlabel.py 40237684 "Core outcomes male infert"
```

Expects a file named `<PMID>.pdf` in the current directory.

---

## Project Structure

```
├── bookmarklet.js               # Bookmarklet source (development, DO NOT bookmark)
├── bookmarklet-minified.js      # Bookmarklet for actual use (COPY THIS ONE)
├── pubmed-extractor.js          # Playwright test/debug script
├── test-urls.txt                # Test URLs
├── package.json                 # Node dependencies
│
├── pmidlabel_gui_enhanced.py    # PMID Renamer GUI source
├── pmidlabel.py                 # PMID Renamer CLI version
│
└── pmidlabel-app/               # Mac .app build resources
    ├── create_mac_app.sh        # Build script
    ├── AppIcon.icns             # App icon
    └── ...
```

## Development

### Bookmarklet Testing (Playwright)

```bash
npm install
npm run test
```

### Rebuilding the Mac App

After editing `pmidlabel_gui_enhanced.py`:

```bash
cd pmidlabel-app && bash create_mac_app.sh
```

## Troubleshooting

**Bookmarklet shows "Could not extract required metadata":**
- Make sure you're on a PubMed article page (`pubmed.ncbi.nlm.nih.gov`)
- Check browser console for extraction logs

**PMID Renamer crashes on launch:**
- Likely using wrong Python (Xcode's Python 3.9 crashes on macOS Sequoia)
- Rebuild with `bash create_mac_app.sh` - the launcher auto-detects a working Python

**tkinterdnd2 "cannot find symbol" error:**
- Python 3.13 is incompatible - install Python 3.11 via Homebrew
- See Dependencies section above

## License

MIT License
