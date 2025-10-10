#!/bin/bash

# Restore index.md files back to README.md after VitePress build
# Restores ALL index.md files in docs directory except .vitepress

echo "Starting index.md → README.md restore after VitePress build..."

# Find and restore index.md files, excluding .vitepress directory
find docs -name "index.md" | while read file; do
    dir=$(dirname "$file")
    echo "Restored: $file → $dir/README.md"
    mv "$file" "$dir/README.md"
done

find planning -name "index.md" | while read file; do
    dir=$(dirname "$file")
    echo "Restored: $file → $dir/README.md"
    mv "$file" "$dir/README.md"
done

echo "Repository is now ready for GitHub editing."