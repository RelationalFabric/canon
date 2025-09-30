#!/bin/bash

# Rename README.md files to index.md for VitePress build
# Skip the main docs directory to avoid conflicts

echo "Starting README.md → index.md rename for VitePress build..."

# Find and rename README.md files in subdirectories only
find docs -name "README.md" -not -path "docs/README.md" | while read file; do
    dir=$(dirname "$file")
    echo "Renamed: $file → $dir/index.md"
    mv "$file" "$dir/index.md"
done

echo "Build process can now proceed with VitePress."