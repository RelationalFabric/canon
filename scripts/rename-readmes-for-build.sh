#!/bin/bash

# Rename README.md files to index.md for VitePress build
# Renames README.md files repository-wide for VitePress routing

echo "Starting README.md → index.md rename for VitePress build..."

# Find and rename README.md files, excluding repository root and .vitepress
find . -name "README.md" \
  -not -path "./README.md" \
  -not -path "./.vitepress/*" \
  -not -path "./node_modules/*" \
  | while read file; do
    dir=$(dirname "$file")
    echo "Renamed: $file → $dir/index.md"
    mv "$file" "$dir/index.md"
done

echo "Build process can now proceed with VitePress."