# PMID Renamer - Quick Start Guide

## 🎯 What This Does

Renames: `40237684.pdf`
To: `Fertil Steril 2025 Rimmer Core outcomes male infert 40237684.pdf`

Automatically fetches journal, year, and author from PubMed!

---

## ⚡ Fastest Setup (2 steps)

### Step 1: Install requirements
```bash
pip install requests
```

### Step 2: Run the GUI
```bash
python3 pmidlabel_gui_enhanced.py
```

That's it! Now you can:
1. Type a description
2. Click "Select PDF Files" 
3. Choose your `{PMID}.pdf` files
4. They're renamed automatically!

---

## 🍎 Want Drag-and-Drop on Mac?

Run this once to create a Mac app:

```bash
chmod +x create_mac_app.sh
./create_mac_app.sh
```

Then drag PDF files onto "PMID Renamer.app" on your Desktop!

---

## 📁 Files Included

1. **pmidlabel.py** - Command line version
2. **pmidlabel_gui_enhanced.py** - GUI version (⭐ recommended)
3. **create_mac_app.sh** - Creates Mac .app bundle
4. **README_GUI.md** - Full documentation

---

## 🎬 Usage Examples

### Command Line:
```bash
pmidlabel 40237684 "Core outcomes male infert"
```

### GUI:
1. Open app
2. Type: "Core outcomes male infert"
3. Select files
4. Done!

### Batch Processing:
- Select 10, 20, 100 PDFs at once
- Same description applied to all
- Watch the activity log!

---

## ✅ File Requirements

- Must be PDF (`.pdf`)
- Must be named with 8-digit PMID
- Examples:
  - ✅ `40237684.pdf`
  - ✅ `12345678.pdf`  
  - ❌ `myfile.pdf`
  - ❌ `123456.pdf` (only 6 digits)

---

## 💡 Pro Tips

**For systematic reviews:**
1. Download all PDFs as `{PMID}.pdf`
2. Open PMID Renamer once
3. Process all papers with same description
4. Get beautifully organized filenames!

**For literature searches:**
- Group by topic using different descriptions
- Files sort automatically by journal/year/author
- PMID always preserved at end for reference

**For your workflow:**
- Add app to Dock for quick access
- Or keep in ~/bin with other scripts
- Process hundreds of papers in minutes!

---

## 🚨 Troubleshooting

**Script won't run?**
```bash
chmod +x pmidlabel_gui_enhanced.py
```

**Missing requests module?**
```bash
pip install requests
```

**Can't find python3?**
```bash
which python3
# Should show: /usr/bin/python3 or similar
```

**Mac blocks the .app?**
- Right-click → Open (first time only)
- Or: System Settings → Privacy & Security → Allow

---

## 🎓 Where to Put Files

**Recommended locations:**

```
~/bin/pmidlabel_gui_enhanced.py    (synced via Dropbox)
~/Applications/PMID Renamer.app    (or /Applications/)
```

**According to your CLAUDE.md:**
- Your ~/bin is symlinked to Dropbox
- Perfect place for this script!
- Available on all your computers

---

## 🤝 Integration with Your Workflow

This works great with your existing `jurolsurvey.py` script!

**Your workflow:**
1. Use PubMed to find papers
2. Download PDFs as {PMID}.pdf
3. Use PMID Renamer to organize filenames
4. Use jurolsurvey.py to create survey documents
5. Keep everything organized and searchable!

---

Need help? Check README_GUI.md for full documentation!
