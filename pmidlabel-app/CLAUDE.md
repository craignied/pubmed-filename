# PMID PDF Renamer - Project Context for Claude Code

## Project Overview

A Python GUI application that automatically renames PDF files based on PubMed metadata. The app takes PDF files named with PubMed IDs (PMIDs) and renames them with journal, year, author, and custom description.

**Example transformation:**
```
Input:  40237684.pdf
Output: Fertil Steril 2025 Rimmer Core outcomes male infert 40237684.pdf
```

## Project Goals

1. Create a user-friendly GUI with text field for description
2. Support drag-and-drop functionality on macOS
3. Batch process multiple PDF files
4. Fetch metadata from PubMed API automatically
5. Provide clear activity logging and error handling
6. Create a Mac .app bundle for easy distribution

## Environment & Dependencies

### System Requirements
- macOS (primary target platform)
- Python 3.8+ with working tkinter
- Internet connection (for PubMed API calls)

### Python Dependencies
```bash
pip install requests       # Required for PubMed API calls
pip install tkinterdnd2    # Required for drag-and-drop onto window
pip install Pillow         # Required for icon generation (optional)
```

### Standard Library Modules Used
- `tkinter` - GUI framework (built into Python)
- `re` - Regular expressions for parsing
- `pathlib` - File path operations
- `threading` - Background processing
- `sys`, `os` - System operations

### User's Environment
- **Computer:** Mac M2 Ultra running macOS Sequoia (macOS 26.1)
- **Python location:** `~/.global_venv/bin/python3` (Python 3.11.4 in global venv)
- **Script directory:** `~/bin` (symlinked to `~/Library/CloudStorage/Dropbox/bin`)
- **Dropbox sync:** All scripts in `~/bin` are shared across multiple computers

### Critical Python Setup Notes

**IMPORTANT:** The app must use the correct Python interpreter:

1. **Avoid Xcode's Python** - Xcode's Python 3.9 has an incompatible Tk/Tcl that crashes on macOS Sequoia
2. **Use venv Python** - The launcher script automatically detects `~/.global_venv/bin/python3` first
3. **Fallback order**: `~/.global_venv` → `/Library/Frameworks/Python.framework` → `/usr/local/bin` → `/opt/homebrew/bin` → `/usr/bin`

**Setting up on a new machine:**
```bash
# 1. Ensure you have a Python with working tkinter
python3 -c "import tkinter; tkinter.Tk()"  # Should not error

# 2. Install dependencies in your venv
pip install requests tkinterdnd2
pip install Pillow  # Optional, only needed to regenerate icon

# 3. Test the GUI directly
python3 pmidlabel_gui_enhanced.py

# 4. Build the app (icon already included via Dropbox sync)
cd ~/bin/pmidlabel
bash create_mac_app.sh
```

## File Structure

```
~/bin/
├── pmidlabel.py                    # Original CLI version
├── pmidlabel_gui_enhanced.py       # Main GUI application (⭐ primary file)
└── pmidlabel/
    ├── CLAUDE.md                   # This file
    ├── create_mac_app.sh           # Script to create Mac .app bundle
    ├── create_icon.py              # Icon generator script
    ├── AppIcon.icns                # App icon file
    ├── AppIcon.iconset/            # Icon source images (generated)
    ├── README_GUI.md               # Full documentation
    └── QUICKSTART.md               # Quick reference guide
```

### Generated Files
```
~/Desktop/PMID Renamer.app/         # Mac application bundle (created by script)
├── Contents/
│   ├── Info.plist                  # App metadata (registers PDF handling, icon)
│   ├── MacOS/
│   │   ├── launcher.sh             # Shell wrapper (finds correct Python)
│   │   └── pmidlabel_gui_enhanced.py  # Copy of main script
│   └── Resources/
│       └── AppIcon.icns            # App icon (copied from pmidlabel/)
```

## How the Application Works

### Architecture
1. **GUI Layer** (tkinter + tkinterdnd2)
   - Minimal UI: just description field and select button
   - Drag-and-drop support directly onto window (via tkinterdnd2)
   - No activity log - just system beep on completion
   - Window size: 400x120 pixels

2. **Processing Layer** (threading)
   - Background thread for file processing
   - Prevents GUI freezing during API calls
   - Silent operation with beep on success

3. **API Layer** (requests)
   - Fetches from PubMed E-utilities
   - Parses MEDLINE format data
   - Extracts: journal abbreviation (TA), year (DP), first author (AU)

4. **File Operations** (pathlib)
   - Validates PMID filenames (8 digits)
   - Renames files with sanitized names
   - Checks for existing files

5. **Drag-and-Drop** (tkinterdnd2)
   - Accepts PDF files dropped directly onto window
   - Only processes if description field is filled
   - Silently ignores drops if no description

### Data Flow
```
1. User enters description in text field
    ↓
2. User either:
   - Clicks "Select PDF Files" button, OR
   - Drags PDF files onto window
    ↓
3. Extract PMID from filename (40237684.pdf → 40237684)
    ↓
4. API Call: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi
    Parameters: db=pubmed, id={PMID}, retmode=text, rettype=medline
    ↓
5. Parse MEDLINE response:
    - TA field → Journal abbreviation
    - DP field → Year
    - AU field (first) → First author last name
    ↓
6. Build new filename: "{Journal} {Year} {Author} {Description} {PMID}.pdf"
    ↓
7. Sanitize filename (remove invalid characters)
    ↓
8. Rename file using Path.rename()
    ↓
9. Beep when all files processed
```

### PubMed API Details

**Endpoint:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`

**Parameters:**
- `db=pubmed` - Database to query
- `id={PMID}` - 8-digit PubMed ID
- `retmode=text` - Return as text
- `rettype=medline` - MEDLINE format

**Response Format (MEDLINE):**
```
PMID- 40237684
TA  - Fertil Steril
DP  - 2025 Jun
AU  - Rimmer MP
AU  - Howie RA
...
```

**Parsing Strategy:**
- Use regex to find fields: `\nTA\s+-\s+(.+)`
- Extract first occurrence of each required field
- Author: Take first word from AU field (last name)

## Key Features Implementation

### 1. GUI with Description Field
```python
self.description_entry = tk.Entry(...)
self.description_var = tk.StringVar()
```
- Large, prominent text field
- Focus set on startup
- Validates before processing

### 2. Drag-and-Drop Support
- **Method 1:** Files passed as command-line arguments
  - When PDFs dropped on .app icon, macOS passes paths as args
  - Captured in `sys.argv[1:]`
  
- **Method 2:** Direct file selection
  - Button triggers `askopenfilenames()` dialog
  - Supports multiple file selection

### 3. Background Processing
```python
thread = threading.Thread(target=self._process_files_thread, ...)
thread.daemon = True
thread.start()
```
- Keeps GUI responsive during API calls
- Daemon thread exits with main program
- Thread-safe logging via `root.after()`

### 4. Activity Logging
```python
def log(self, message):
    self.root.after(0, lambda: self.log_text.insert(tk.END, message + "\n"))
```
- Thread-safe updates using `after()`
- Scrollable text widget
- Emoji status indicators (✅ ❌ ⚠️)

## Known Issues & Limitations

### Drag-and-Drop Behavior
- **✅ WORKING:** Drag files directly onto the window (via tkinterdnd2)
- **Requirement:** Description field must be filled before dropping
- **Behavior:** Silently ignores drops if no description is entered

### Current Limitations
1. **API rate limiting:** PubMed E-utilities has rate limits
   - **Mitigation:** Process files sequentially
   - **Not implemented:** No configurable delays

2. **Network dependency:** Requires internet connection
   - **No offline mode:** Could cache results but not implemented

3. **Python interpreter sensitivity:**
   - **Critical:** Must use Python with working tkinter
   - **Avoid:** Xcode's Python 3.9 (crashes on macOS Sequoia)
   - **Solution:** launcher.sh automatically finds correct Python

### Validation Gaps
- Doesn't verify PDF is actually valid PDF format
- Doesn't check if PMID exists before API call
- No retry logic for failed API calls

### macOS Specific
- Requires manual "Open" on first launch (Gatekeeper)
- .app bundle not code-signed
- No DMG installer provided
- App must be re-registered with macOS after creation (`lsregister -f`)

## Testing Checklist

### Basic Functionality
- [ ] GUI opens without errors
- [ ] Description field accepts text input
- [ ] "Select PDF Files" button opens file dialog
- [ ] Can select single PDF file
- [ ] Can select multiple PDF files
- [ ] Activity log displays messages
- [ ] Clear Log button works

### File Processing
- [ ] Correctly processes file named `12345678.pdf`
- [ ] Rejects file with non-8-digit name
- [ ] Rejects non-PDF files
- [ ] Handles missing files gracefully
- [ ] Doesn't overwrite existing files

### API Integration
- [ ] Successfully fetches data for valid PMID
- [ ] Handles invalid PMID (not found)
- [ ] Handles network errors
- [ ] Parses journal abbreviation correctly
- [ ] Parses year correctly
- [ ] Parses first author correctly

### Edge Cases
- [ ] Empty description handling
- [ ] Special characters in description
- [ ] Very long descriptions
- [ ] Files in different directories
- [ ] Read-only files
- [ ] Files already open in another app

### Mac .app Bundle
- [ ] App launches by double-clicking
- [ ] Dragging PDFs onto icon works
- [ ] Prompts for description if not set
- [ ] Processes multiple dropped files
- [ ] App can be moved to /Applications

## Troubleshooting Guide

### Problem: App crashes immediately on launch
**Cause:** Using wrong Python interpreter (likely Xcode's Python 3.9)

**Diagnosis:**
Check the crash log in Console.app for: `/Applications/Xcode.app/Contents/Developer/Library/Frameworks/Python3.framework`

**Solution:**
```bash
# Ensure tkinterdnd2 is installed in your venv
pip install tkinterdnd2

# Rebuild the app (launcher.sh will find correct Python)
cd ~/bin/pmidlabel
bash create_mac_app.sh
```

### Problem: "cannot find symbol 'tkdnd_Init'" error with Python 3.13
**Cause:** Python 3.13 doesn't have compatible tkinterdnd2 native libraries for macOS

**Error message:**
```
_tkinter.TclError: cannot find symbol "tkdnd_Init": dlsym(0x8c3254a0, tkdnd_Init): symbol not found
RuntimeError: Unable to load tkdnd library.
```

**Solution:**
```bash
# Install Python 3.11 via Homebrew
brew install python@3.11
brew install python-tk@3.11

# Install dependencies for Python 3.11
/opt/homebrew/bin/python3.11 -m pip install requests tkinterdnd2

# Rebuild the app (launcher.sh now prioritizes Python 3.11)
cd ~/bin/pmidlabel
bash create_mac_app.sh
```

**Note:** This does NOT require changing your `~/.global_venv`. The app will use Homebrew's Python 3.11 automatically while other scripts continue using your global_venv.

### Problem: "Module 'requests' not found" or "Module 'tkinterdnd2' not found"
**Solution:**
```bash
# Install in your active Python environment
pip install requests tkinterdnd2

# Or specify the venv explicitly
~/.global_venv/bin/pip install requests tkinterdnd2
```

### Problem: GUI window doesn't appear
**Check:**
1. Run from terminal to see error messages:
   ```bash
   python3 ~/bin/pmidlabel_gui_enhanced.py
   ```
2. Check tkinter installation:
   ```python
   python3 -c "import tkinter; tkinter.Tk()"
   ```
3. Check tkinterdnd2 installation:
   ```python
   python3 -c "import tkinterdnd2; print('OK')"
   ```

### Problem: Drag-drop doesn't work
**Expected behavior:**
- Drag PDFs directly onto the **window** (not the app icon)
- Must have description entered first
- Silently ignores drops if no description

**If not working:**
1. Check tkinterdnd2 is installed: `pip show tkinterdnd2`
2. Rebuild the app: `bash create_mac_app.sh`
3. Test script directly: `python3 pmidlabel_gui_enhanced.py`

### Problem: "Permission denied" when renaming
**Causes:**
- File is read-only
- File is open in another application
- Insufficient permissions on directory

**Solution:**
```bash
chmod 644 *.pdf  # Make files writable
```

### Problem: API returns no data
**Check:**
1. PMID is valid (8 digits)
2. Internet connection working
3. PubMed API is accessible:
   ```bash
   curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=40237684&retmode=text&rettype=medline"
   ```

### Problem: Mac blocks the .app / Gatekeeper warning
**Solution:**
```bash
# Remove quarantine attribute
xattr -cr ~/Desktop/PMID\ Renamer.app

# Or right-click → Open (first time only)
```

### Problem: Moving app to another Mac doesn't work
**Solution on new Mac:**
```bash
# 1. Ensure Python environment is set up
pip install requests tkinterdnd2

# 2. Rebuild the app (don't copy the .app, rebuild it)
cd ~/bin/pmidlabel
bash create_mac_app.sh

# 3. The launcher.sh will automatically find the correct Python
```

## Cross-Machine Deployment

### Syncing via Dropbox

Since `~/bin` is symlinked to Dropbox, the scripts automatically sync across machines. However, the `.app` bundle does **not** sync well and should be rebuilt on each machine.

### Setup on a New Mac

**Step 1: Verify symlink**
```bash
ls -la ~/bin
# Should show: ~/bin -> /Users/[username]/Library/CloudStorage/Dropbox/bin
```

**Step 2: Set up Python environment**
```bash
# Check if you have a working Python with tkinter
python3 -c "import tkinter; tkinter.Tk()"

# Install required packages
pip install requests tkinterdnd2
```

**Step 3: Build the app**
```bash
cd ~/bin/pmidlabel
bash create_mac_app.sh
```

**Step 4: Test**
```bash
# Open the app
open ~/Desktop/PMID\ Renamer.app

# Or test the script directly
python3 ~/bin/pmidlabel_gui_enhanced.py
```

### Key Points for Multi-Machine Setup

1. **Don't copy the .app bundle** - Always rebuild it on each machine
2. **Python versions may differ** - The launcher.sh handles this automatically
3. **Install dependencies per machine** - Each Mac needs `requests` and `tkinterdnd2`
4. **Xcode's Python causes crashes** - The launcher.sh avoids it automatically
5. **Scripts sync automatically** - Via Dropbox, but .app bundles do not

### What Syncs via Dropbox
- ✅ `pmidlabel_gui_enhanced.py` (main script)
- ✅ `pmidlabel.py` (CLI version)
- ✅ `create_mac_app.sh` (app builder)
- ✅ `create_icon.py` (icon generator)
- ✅ `AppIcon.icns` (app icon file)
- ✅ `CLAUDE.md`, `README_GUI.md`, etc. (documentation)
- ❌ `PMID Renamer.app` (must rebuild on each machine)

## App Icon

### Icon Design

The app uses a custom icon that clearly identifies its purpose:

- **Design:** White document on blue gradient background
- **Top text:** "PMID" in blue (representing PubMed IDs)
- **Bottom text:** "PDF" in red (representing PDF files)
- **Sizes:** All standard macOS sizes from 16x16 to 512x512 (Retina ready)

### Icon Files

- **`AppIcon.icns`** - Final icon file used by the app
- **`AppIcon.iconset/`** - Source PNG images at various sizes
- **`create_icon.py`** - Python script to generate the icon

### Regenerating the Icon

If you want to modify the icon:

```bash
cd ~/bin/pmidlabel

# Edit create_icon.py to change colors, text, or design

# Generate new icon
python3 create_icon.py
iconutil -c icns AppIcon.iconset

# Rebuild the app with new icon
bash create_mac_app.sh
```

The icon generation requires **Pillow** (PIL):
```bash
pip install Pillow
```

### Icon Technical Details

- **Format:** macOS .icns (Icon Composer format)
- **Source:** Generated programmatically using PIL/Pillow
- **Sizes included:** 16, 32, 128, 256, 512 pixels (1x and 2x for Retina)
- **Colors:** Professional blue gradient (#4682B4 theme) with white document
- **Font:** Helvetica (system font)

### Using the App

The app can be placed anywhere and will work:
- ✅ **Desktop** - Default location after building
- ✅ **/Applications** - Drag it there for permanent installation
- ✅ **Dock** - Drag to Dock for quick access
- ✅ **Any folder** - Works from any location

**Important:** Files are renamed **in place** - if you drag a PDF from `~/Downloads`, it gets renamed in `~/Downloads`.

## Development Roadmap

### Potential Enhancements
1. **Visual feedback:**
   - Add visual indication when dragging over window
   - Show progress during batch processing
   - Add success/error notifications

2. **Batch operations:**
   - Save/load description presets
   - Process entire folders recursively
   - Export rename log to CSV

3. **Advanced features:**
   - Cache API results to avoid re-fetching
   - Custom filename templates
   - Preview before rename
   - Undo last operation

4. **Error handling:**
   - Retry failed API calls
   - Offline mode with cached data
   - Better validation of PDF files

5. **UI improvements:**
   - Dark mode support
   - Progress bar for batch operations
   - Recent descriptions dropdown
   - Preferences/settings window

6. **Integration:**
   - Direct PubMed search in app
   - Integration with jurolsurvey.py workflow
   - Export to reference managers

## Integration with Existing Workflow

### User's Current Process (jurolsurvey.py)
1. Maintains text files with PMIDs
2. Maintains comment files named `{PMID}.txt`
3. Creates Word documents with citations and comments
4. Uses PubMed API (same E-utilities endpoint)

### How PMID Renamer Fits
```
Step 1: Search PubMed for papers
    ↓
Step 2: Download PDFs as {PMID}.pdf
    ↓
Step 3: Use PMID Renamer to organize filenames  ← NEW
    ↓
Step 4: Create comment files {PMID}.txt
    ↓
Step 5: Use jurolsurvey.py to create survey document
```

### Potential Future Integration
- Could merge functionality into jurolsurvey.py
- Could create unified literature management tool
- Could share API fetching code between scripts

## Testing Example

### Quick Test
```bash
# Create test PDF
echo "test" > 40237684.pdf

# Run GUI
python3 pmidlabel_gui_enhanced.py

# Enter description: "Core outcomes male infert"
# Click "Select PDF Files", choose 40237684.pdf
# Expected result: Fertil Steril 2025 Rimmer Core outcomes male infert 40237684.pdf
```

### Batch Test
```bash
# Create multiple test PDFs
for pmid in 40237684 39122706 38744536; do
    echo "test" > ${pmid}.pdf
done

# Run GUI and select all three
# All should be renamed with same description
```

## References

- **PubMed E-utilities:** https://www.ncbi.nlm.nih.gov/books/NBK25501/
- **MEDLINE format:** https://www.nlm.nih.gov/bsd/mms/medlineelements.html
- **tkinter docs:** https://docs.python.org/3/library/tkinter.html
- **pathlib docs:** https://docs.python.org/3/library/pathlib.html

## Contact Context

**User:** Craig Niederberger (Craigbot)
- Department Head of Urology at UIC
- Conducts systematic literature reviews
- Uses similar scripts for PubMed data (jurolsurvey.py)
- Mac user with M2 Ultra
- Syncs scripts via Dropbox to ~/bin
- Familiar with Python, command line, and research workflows

## Notes for Claude Code

When helping with this project:
1. User is technically proficient but values simple, reliable solutions
2. Focus on macOS compatibility
3. Maintain compatibility with existing jurolsurvey.py workflow
4. Keep dependencies minimal (avoid complex installations)
5. Prioritize reliability over features
6. GUI should be clean and professional (medical research context)
7. Error messages should be clear and actionable
8. Remember user has multiple Macs synced via Dropbox

## Key Lessons Learned

### Critical Issues Resolved

1. **Python Interpreter Selection**
   - **Problem:** Xcode's Python 3.9 has incompatible Tk/Tcl that crashes on macOS Sequoia
   - **Solution:** Modified `launcher.sh` to search for Python in specific order, prioritizing `~/.global_venv`
   - **Impact:** App now works reliably across different macOS configurations

2. **Drag-and-Drop Implementation**
   - **Problem:** Native tkinter doesn't support drag-and-drop on macOS
   - **Solution:** Added `tkinterdnd2` dependency for window-based drag-and-drop
   - **Impact:** Users can drag files directly onto the window (preferred workflow)

3. **App Registration**
   - **Problem:** macOS didn't recognize the app as a PDF handler
   - **Solution:** Added `lsregister -f` to force macOS to recognize the app
   - **Impact:** Drag-and-drop now works immediately after building

4. **UI Simplification**
   - **Problem:** Activity log was buggy and unnecessary
   - **Solution:** Removed log, kept only description field and select button
   - **Impact:** Clean, minimal interface (400x120px) with silent operation + beep

5. **Custom App Icon**
   - **Problem:** Generic app icon didn't convey purpose
   - **Solution:** Created programmatic icon generator using Pillow showing "PMID" and "PDF"
   - **Impact:** Professional appearance, easy to identify in Dock/Finder

6. **Python 3.13 Incompatibility with tkinterdnd2**
   - **Problem:** Python 3.13 doesn't have compatible tkinterdnd2 native libraries for macOS, causing "cannot find symbol 'tkdnd_Init'" error
   - **Solution:**
     - Installed Python 3.11 via Homebrew: `brew install python@3.11`
     - Installed tkinter for Python 3.11: `brew install python-tk@3.11`
     - Installed dependencies: `/opt/homebrew/bin/python3.11 -m pip install requests tkinterdnd2`
     - Updated `create_mac_app.sh` launcher to prioritize `/opt/homebrew/bin/python3.11` before `~/.global_venv`
   - **Impact:** App works reliably on systems with Python 3.13, without breaking global_venv setup
   - **Date resolved:** November 2025

7. **Filename Space Handling**
   - **Problem:** Files with leading/trailing spaces in names (e.g., ` 40237684.pdf`) failed validation silently
   - **Solution:** Added `.strip()` to PMID extraction: `pmid = file_path.stem.strip()`
   - **Impact:** More robust handling of incorrectly named files
   - **Date resolved:** November 2025

### Design Decisions

- **Minimal UI:** Just description field and button - drag-and-drop is the primary workflow
- **Silent operation:** No popups or logs - just a system beep on completion
- **Thread safety:** All file operations in background thread to keep GUI responsive
- **Graceful degradation:** Falls back to button if tkinterdnd2 not available
- **In-place renaming:** Files renamed where they are, not moved to a special folder
- **Portable app:** Works from any location (Desktop, /Applications, Dock)

## Quick Commands for Claude Code

```bash
# Run the GUI directly (for testing)
python3 ~/bin/pmidlabel_gui_enhanced.py
# Or with Homebrew Python 3.11 (if Python 3.13 has issues):
/opt/homebrew/bin/python3.11 ~/bin/pmidlabel_gui_enhanced.py

# Create Mac app (always rebuild, don't copy)
cd ~/bin/pmidlabel
bash create_mac_app.sh

# Test a single file with CLI version
python3 ~/bin/pmidlabel.py 40237684 "Test description"

# Check all dependencies
python3 -c "import tkinter, tkinterdnd2, requests, pathlib, threading; print('All imports OK')"

# Verify tkinter works
python3 -c "import tkinter; tkinter.Tk()"

# View PubMed API response
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=40237684&retmode=text&rettype=medline"

# Remove quarantine from app
xattr -cr ~/Desktop/PMID\ Renamer.app

# Install Python 3.11 via Homebrew (if needed for Python 3.13 compatibility)
brew install python@3.11 python-tk@3.11
/opt/homebrew/bin/python3.11 -m pip install requests tkinterdnd2
```
