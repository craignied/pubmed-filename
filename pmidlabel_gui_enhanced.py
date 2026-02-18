#!/usr/bin/env python3

"""
Enhanced Mac GUI version with better drag-and-drop support
Can also be used as a droplet by dropping files directly on the script icon
"""

import re
import sys
import os
from pathlib import Path
import tkinter as tk
from tkinter import messagebox
import requests
import threading

try:
    from tkinterdnd2 import TkinterDnD, DND_FILES
    HAVE_DND = True
except ImportError:
    HAVE_DND = False


class PmidLabelGUI:
    def __init__(self, root, initial_files=None):
        self.root = root
        self.root.title("PMID PDF Renamer")
        self.root.geometry("650x550")
        
        # Store any files passed at launch
        self.pending_files = initial_files or []
        
        self.setup_ui()
        
        # If files were dropped on app icon, process them after UI is ready
        if self.pending_files:
            self.root.after(500, self.process_pending_files)
        
    def setup_ui(self):
        """Create the user interface"""
        self.root.geometry("400x120")

        # Description field
        frame = tk.Frame(self.root, padx=20, pady=20)
        frame.pack(fill=tk.BOTH, expand=True)

        tk.Label(frame, text="Description:", font=("Helvetica", 12)).pack(anchor=tk.W)

        self.description_var = tk.StringVar()

        entry_frame = tk.Frame(frame)
        entry_frame.pack(fill=tk.X, pady=(5, 10))

        self.description_entry = tk.Entry(
            entry_frame,
            textvariable=self.description_var,
            font=("Helvetica", 14)
        )
        self.description_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)

        clear_btn = tk.Button(
            entry_frame,
            text="\u00d7",
            command=lambda: (self.description_var.set(""), self.description_entry.focus()),
            font=("Helvetica", 14),
            width=2,
            relief=tk.FLAT
        )
        clear_btn.pack(side=tk.LEFT, padx=(4, 0))

        self.description_entry.focus()

        # Select button
        select_btn = tk.Button(
            frame,
            text="Select PDF Files",
            command=self.select_files,
            font=("Helvetica", 12)
        )
        select_btn.pack()

        # Setup drag and drop if available
        if HAVE_DND:
            self.root.drop_target_register(DND_FILES)
            self.root.dnd_bind('<<Drop>>', self.on_drop)

    def on_drop(self, event):
        """Handle drag and drop onto window"""
        files = self.root.tk.splitlist(event.data)
        pdf_files = [f for f in files if f.lower().endswith('.pdf')]

        if not pdf_files:
            return

        description = self.description_var.get().strip()
        if not description:
            return

        self.process_files(pdf_files, description)

    def select_files(self):
        from tkinter.filedialog import askopenfilenames

        description = self.description_var.get().strip()
        if not description:
            return

        files = askopenfilenames(filetypes=[("PDF files", "*.pdf")])
        if files:
            self.process_files(list(files), description)

    
    def process_pending_files(self):
        """Process files that were dropped on the app icon at launch"""
        if not self.pending_files:
            return

        description = self.description_var.get().strip()
        if not description:
            return

        self.process_files(self.pending_files, description)
        self.pending_files = []
    
    def process_files(self, files, description):
        """Process files in a separate thread"""
        if not files:
            return
        
        # Process in background thread to keep UI responsive
        thread = threading.Thread(
            target=self._process_files_thread, 
            args=(files, description)
        )
        thread.daemon = True
        thread.start()
    
    def _process_files_thread(self, files, description):
        """Process files in background thread"""
        success_count = 0
        skip_count = 0
        error_count = 0

        for file_path in files:
            result = self.process_single_file(Path(file_path), description)
            if result == "success":
                success_count += 1
            elif result == "skip":
                skip_count += 1
            else:
                error_count += 1

        # Done - just beep
        if success_count > 0:
            self.root.after(0, lambda: self.root.bell())
    
    def process_single_file(self, file_path: Path, description: str):
        """Process a single PDF file. Returns: 'success', 'skip', or 'error'"""
        try:
            # Validate it's a PDF
            if file_path.suffix.lower() != '.pdf':
                return "skip"

            # Extract PMID from filename (strip any spaces)
            pmid = file_path.stem.strip()
            if not pmid.isdigit() or len(pmid) != 8:
                return "skip"

            # Check file exists
            if not file_path.exists():
                return "error"

            # Fetch PubMed data
            medline_data = self.fetch_pubmed_data(pmid)
            journal, year, first_author = self.parse_medline_data(medline_data, pmid)

            # Build new filename
            new_filename = f"{journal} {year} {first_author} {description} {pmid}.pdf"
            new_filename = self.sanitize_filename(new_filename)
            new_path = file_path.parent / new_filename

            # Check if target exists
            if new_path.exists() and new_path != file_path:
                return "skip"

            # Rename
            file_path.rename(new_path)

            return "success"

        except Exception as e:
            return "error"
    
    def fetch_pubmed_data(self, pmid: str) -> str:
        """Fetch PubMed data in MEDLINE format"""
        pubmed_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
        params = {
            'db': 'pubmed',
            'id': pmid,
            'retmode': 'text',
            'rettype': 'medline'
        }
        response = requests.get(pubmed_url, params=params, timeout=10)
        response.raise_for_status()
        return response.text
    
    def parse_medline_data(self, medline_text: str, pmid: str) -> tuple:
        """Parse MEDLINE format to extract journal abbreviation, year, and first author"""
        # Extract journal abbreviation (TA field)
        journal_match = re.search(r'\nTA\s+-\s+(.+)', medline_text)
        if not journal_match:
            raise ValueError(f"Could not find journal abbreviation")
        journal = journal_match.group(1).strip()
        
        # Extract year from publication date (DP field)
        year_match = re.search(r'\nDP\s+-\s+(\d{4})', medline_text)
        if not year_match:
            raise ValueError(f"Could not find publication year")
        year = year_match.group(1)
        
        # Extract first author's last name (first AU field)
        author_match = re.search(r'\nAU\s+-\s+(.+)', medline_text)
        if not author_match:
            raise ValueError(f"Could not find author")
        
        author_full = author_match.group(1).strip()
        first_author = author_full.split()[0] if ' ' in author_full else author_full
        
        return journal, year, first_author
    
    def sanitize_filename(self, filename: str) -> str:
        """Remove or replace characters that are invalid in filenames"""
        filename = re.sub(r'[<>:"/\\|?*]', ' ', filename)
        filename = re.sub(r'\s+', ' ', filename)
        return filename.strip()


def main():
    # Check if files were passed as arguments (when dropping on app icon)
    initial_files = None
    if len(sys.argv) > 1:
        # Files were dropped on the app icon or passed as arguments
        initial_files = [arg for arg in sys.argv[1:] if Path(arg).suffix.lower() == '.pdf']

    # Use TkinterDnD if available for drag-and-drop support
    if HAVE_DND:
        root = TkinterDnD.Tk()
    else:
        root = tk.Tk()

    app = PmidLabelGUI(root, initial_files=initial_files)
    root.mainloop()


if __name__ == "__main__":
    main()
