#!/bin/bash

# Restore index.md files back to README.md after VitePress build
# Skip .vitepress directory and main docs directory

echo "Starting index.md → README.md restore after VitePress build..."

# Find and restore index.md files, excluding .vitepress and main docs
find docs -name "index.md" -not -path "docs/.vitepress/*" -not -path "docs/index.md" | while read file; do
    dir=$(dirname "$file")
    echo "Restored: $file → $dir/README.md"
    mv "$file" "$dir/README.md"
done

echo "Repository is now ready for GitHub editing."