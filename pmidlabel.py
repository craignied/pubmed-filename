#!/usr/bin/env python3

"""
Renames a PDF file based on PubMed metadata
Usage: pmidlabel.py <PMID> <description>
Example: pmidlabel.py 40237684 "Core outcomes male infert"

Renames {PMID}.pdf to: {Journal} {Year} {FirstAuthor} {description} {PMID}.pdf
"""

import argparse
import re
import sys
from pathlib import Path
import requests


def fetch_pubmed_data(pmid: str) -> str:
    """Fetch PubMed data in MEDLINE format"""
    pubmed_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
    params = {
        'db': 'pubmed',
        'id': pmid,
        'retmode': 'text',
        'rettype': 'medline'
    }
    response = requests.get(pubmed_url, params=params)
    response.raise_for_status()
    return response.text


def parse_medline_data(medline_text: str, pmid: str) -> tuple[str, str, str]:
    """
    Parse MEDLINE format to extract journal abbreviation, year, and first author
    Returns: (journal_abbrev, year, first_author_lastname)
    """
    # Extract journal abbreviation (TA field)
    journal_match = re.search(r'\nTA\s+-\s+(.+)', medline_text)
    if not journal_match:
        raise ValueError(f"Could not find journal abbreviation for PMID {pmid}")
    journal = journal_match.group(1).strip()
    
    # Extract year from publication date (DP field)
    year_match = re.search(r'\nDP\s+-\s+(\d{4})', medline_text)
    if not year_match:
        raise ValueError(f"Could not find publication year for PMID {pmid}")
    year = year_match.group(1)
    
    # Extract first author's last name (first AU field)
    author_match = re.search(r'\nAU\s+-\s+(.+)', medline_text)
    if not author_match:
        raise ValueError(f"Could not find author for PMID {pmid}")
    
    # Author format is usually "Last Name First Initial(s)" or "Last Name FI"
    # We want just the last name
    author_full = author_match.group(1).strip()
    # Take everything before the first space as the last name
    first_author = author_full.split()[0] if ' ' in author_full else author_full
    
    return journal, year, first_author


def sanitize_filename(filename: str) -> str:
    """Remove or replace characters that are invalid in filenames"""
    # Replace problematic characters with spaces or remove them
    filename = re.sub(r'[<>:"/\\|?*]', ' ', filename)
    # Replace multiple spaces with single space
    filename = re.sub(r'\s+', ' ', filename)
    return filename.strip()


def rename_pdf(pmid: str, description: str, directory: Path = None) -> None:
    """
    Rename PDF file from {PMID}.pdf to formatted name
    """
    if directory is None:
        directory = Path.cwd()
    
    # Check if source file exists
    source_file = directory / f"{pmid}.pdf"
    if not source_file.exists():
        raise FileNotFoundError(f"PDF file not found: {source_file}")
    
    # Fetch and parse PubMed data
    print(f"Fetching metadata for PMID {pmid}...")
    medline_data = fetch_pubmed_data(pmid)
    journal, year, first_author = parse_medline_data(medline_data, pmid)
    
    # Build new filename
    new_filename = f"{journal} {year} {first_author} {description} {pmid}.pdf"
    new_filename = sanitize_filename(new_filename)
    new_file = directory / new_filename
    
    # Check if target file already exists
    if new_file.exists():
        response = input(f"File '{new_filename}' already exists. Overwrite? (y/n): ")
        if response.lower() != 'y':
            print("Rename cancelled.")
            return
    
    # Rename the file
    source_file.rename(new_file)
    print(f"Renamed to: {new_filename}")


def main():
    parser = argparse.ArgumentParser(
        description="Rename PDF file based on PubMed metadata",
        epilog="Example: pmidlabel 40237684 'Core outcomes male infert'"
    )
    parser.add_argument('pmid', help='PubMed ID (8 digits)')
    parser.add_argument('description', help='Description string for filename')
    parser.add_argument('-d', '--directory', type=Path, default=None,
                        help='Directory containing PDF (default: current directory)')
    
    args = parser.parse_args()
    
    # Validate PMID
    if not args.pmid.isdigit() or len(args.pmid) != 8:
        print(f"Error: PMID must be 8 digits, got '{args.pmid}'", file=sys.stderr)
        sys.exit(1)
    
    try:
        rename_pdf(args.pmid, args.description, args.directory)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
