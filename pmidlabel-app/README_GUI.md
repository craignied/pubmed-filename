# PMID PDF Renamer - GUI Version

Automatically rename PDF files based on PubMed metadata with an easy-to-use GUI!

## 📦 What You Get

Three versions are provided:
1. **pmidlabel.py** - Command-line version (original)
2. **pmidlabel_gui_enhanced.py** - GUI version (recommended)
3. Mac .app bundle (created via setup script)

## 🚀 Quick Setup

### Requirements
```bash
pip install requests
```

### Option A: Run the Python GUI directly

1. Save `pmidlabel_gui_enhanced.py` to your `~/bin` directory
2. Make it executable:
   ```bash
   chmod +x ~/bin/pmidlabel_gui_enhanced.py
   ```
3. Run it:
   ```bash
   python3 ~/bin/pmidlabel_gui_enhanced.py
   ```

### Option B: Create a Mac .app (Drag-and-Drop Support!)

This creates a proper Mac application that you can drag PDF files onto:

1. Save both files to the same directory:
   - `pmidlabel_gui_enhanced.py`
   - `create_mac_app.sh`

2. Run the setup script:
   ```bash
   chmod +x create_mac_app.sh
   ./create_mac_app.sh
   ```

3. This creates `PMID Renamer.app` on your Desktop

4. **Move it to Applications** (optional but recommended):
   ```bash
   mv ~/Desktop/PMID\ Renamer.app /Applications/
   ```

## 🎯 How to Use

### Method 1: Using the GUI Button
1. Open the PMID Renamer app
2. Type your description in the text field (e.g., "Core outcomes male infert")
3. Click "📁 Select PDF Files"
4. Choose your PDF files (must be named like `40237684.pdf`)
5. Watch the magic happen!

### Method 2: Drag-and-Drop (Mac .app only)
1. Enter description in the app first, OR
2. Drag PDF files directly onto the app icon
3. If no description is set, you'll be prompted for one
4. Files are renamed automatically!

### Method 3: Command Line (original version)
```bash
pmidlabel 40237684 "Core outcomes male infert"
```

## 📝 Example

**Input file:** `40237684.pdf`

**Description:** "Core outcomes male infert"

**Output file:** `Fertil Steril 2025 Rimmer Core outcomes male infert 40237684.pdf`

The script automatically fetches from PubMed:
- Journal abbreviation (Fertil Steril)
- Publication year (2025)
- First author's last name (Rimmer)

## 🎨 GUI Features

- **Clean interface** with large text entry field
- **Real-time activity log** showing what's happening
- **Batch processing** - select multiple files at once
- **Error handling** - clear messages if something goes wrong
- **Smart validation** - only processes valid 8-digit PMID filenames
- **Progress tracking** - see each file being processed

## 📋 File Requirements

- Files must be PDF format (`.pdf`)
- Filenames must be exactly 8 digits (the PMID)
- Examples of valid filenames:
  - ✅ `40237684.pdf`
  - ✅ `12345678.pdf`
  - ❌ `paper.pdf` (not a PMID)
  - ❌ `1234567.pdf` (only 7 digits)

## 🔧 Troubleshooting

### "Module not found: requests"
```bash
pip install requests
```

### "Permission denied"
Make sure the script is executable:
```bash
chmod +x pmidlabel_gui_enhanced.py
```

### App won't open on Mac
If macOS blocks the app, right-click and choose "Open" the first time.

### Can't find python3
Check your Python installation:
```bash
which python3
python3 --version
```

## 💡 Tips

- **Keep the description concise** - it goes in the filename!
- **Process multiple files at once** - select as many as you want
- **Original PMID preserved** - it's always at the end of the new filename
- **Activity log is scrollable** - review what happened to each file
- **Clear log button** - start fresh when processing a new batch

## 🗂️ Workflow Example

A typical workflow for organizing your literature:

1. Download PDFs from PubMed, saving them as `{PMID}.pdf`
2. Open PMID Renamer
3. Enter a brief description of the topic
4. Select all PDFs for that topic
5. Get nicely formatted filenames for easy sorting!

Your organized filenames will sort alphabetically by:
- Journal
- Year  
- First author
- Your custom description

Perfect for systematic reviews and literature organization!

## 📚 Advanced: Creating an Automator Quick Action

Want to right-click PDFs in Finder and rename them?

1. Open Automator
2. Create new "Quick Action"
3. Set "Workflow receives" to "PDF files" in "Finder"
4. Add "Run Shell Script" action
5. Paste:
   ```bash
   for f in "$@"
   do
       python3 /path/to/pmidlabel_gui_enhanced.py "$f"
   done
   ```
6. Save as "Rename with PMID"

Now right-click any PDF → Quick Actions → Rename with PMID

## 🐛 Known Issues

- On some Macs, drag-drop onto the app icon requires you to set a default description first by opening the app
- Very old PDFs might have incomplete metadata in PubMed
- Network connection required (fetches from PubMed API)

## 📄 License

Free to use and modify for your research needs!

## 🙏 Credits

Based on your existing `jurolsurvey.py` script.
Uses PubMed E-utilities API.
