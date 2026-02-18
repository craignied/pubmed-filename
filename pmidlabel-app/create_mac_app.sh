#!/bin/bash

# Script to create a Mac .app bundle for PMID PDF Renamer
# This allows you to drag-drop PDF files onto the app icon

APP_NAME="PMID Renamer"
SCRIPT_NAME="pmidlabel_gui_enhanced.py"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# The Python script is in the parent directory
SOURCE_SCRIPT="$SCRIPT_DIR/../$SCRIPT_NAME"

# Check if source script exists
if [ ! -f "$SOURCE_SCRIPT" ]; then
    echo "Error: Cannot find $SCRIPT_NAME at $SOURCE_SCRIPT"
    exit 1
fi

# Determine where to create the app (/Applications by default, override with -d)
APP_DIR="/Applications/${APP_NAME}.app"
if [ "$1" = "-d" ] && [ -n "$2" ]; then
    APP_DIR="$2/${APP_NAME}.app"
fi

echo "Creating Mac app bundle: ${APP_NAME}.app"
echo "Location: $APP_DIR"
echo "Source script: $SOURCE_SCRIPT"

# Create app structure
mkdir -p "$APP_DIR/Contents/MacOS"
mkdir -p "$APP_DIR/Contents/Resources"

# Copy the Python script
cp "$SOURCE_SCRIPT" "$APP_DIR/Contents/MacOS/"
chmod +x "$APP_DIR/Contents/MacOS/$SCRIPT_NAME"

# Copy icon if it exists
ICON_FILE="$SCRIPT_DIR/AppIcon.icns"
if [ -f "$ICON_FILE" ]; then
    cp "$ICON_FILE" "$APP_DIR/Contents/Resources/AppIcon.icns"
    echo "Icon added to app"
fi

# Create launcher script
cat > "$APP_DIR/Contents/MacOS/launcher.sh" << 'EOF'
#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Find Python - prioritize Python 3.11 from Homebrew (works with tkinterdnd2)
if [ -f "/opt/homebrew/bin/python3.11" ]; then
    PYTHON="/opt/homebrew/bin/python3.11"
elif [ -f "$HOME/.global_venv/bin/python3" ]; then
    PYTHON="$HOME/.global_venv/bin/python3"
elif [ -f "/Library/Frameworks/Python.framework/Versions/3.11/bin/python3" ]; then
    PYTHON="/Library/Frameworks/Python.framework/Versions/3.11/bin/python3"
elif [ -f "/usr/local/bin/python3.11" ]; then
    PYTHON="/usr/local/bin/python3.11"
elif [ -f "/opt/homebrew/bin/python3" ]; then
    PYTHON="/opt/homebrew/bin/python3"
else
    PYTHON="/usr/bin/python3"
fi

# Run the Python script with any dropped files as arguments
cd "$DIR"
"$PYTHON" pmidlabel_gui_enhanced.py "$@"
EOF

chmod +x "$APP_DIR/Contents/MacOS/launcher.sh"

# Create Info.plist
cat > "$APP_DIR/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher.sh</string>
    <key>CFBundleIdentifier</key>
    <string>com.niederberger.pmidrenamer</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleDocumentTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeExtensions</key>
            <array>
                <string>pdf</string>
            </array>
            <key>CFBundleTypeName</key>
            <string>PDF Document</string>
            <key>CFBundleTypeRole</key>
            <string>Viewer</string>
            <key>LSHandlerRank</key>
            <string>Alternate</string>
        </dict>
    </array>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

# Create a simple icon (text-based)
# For a better icon, you can create a .icns file and place it in Resources/

echo ""
echo "✅ App created successfully!"
echo ""
echo "Location: $APP_DIR"
echo ""

# Force macOS to re-register the app so drag-drop works
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_DIR"

echo "Usage:"
echo "1. Double-click the app to open the GUI"
echo "2. Or drag PDF files onto the app icon to process them"
echo ""
echo "The app is on your Desktop. You can move it wherever you like,"
echo "such as to /Applications or keep it in ~/bin for easy access."
echo ""
