#!/bin/bash

# Rename README.md files to index.md for VitePress build
# Renames ALL README.md files in docs directory

echo "Starting README.md → index.md rename for VitePress build..."

# Find and rename ALL README.md files in docs directory
find docs -name "README.md" | while read file; do
    dir=$(dirname "$file")
    echo "Renamed: $file → $dir/index.md"
    mv "$file" "$dir/index.md"
done

find planning -name "README.md" | while read file; do
    dir=$(dirname "$file")
    echo "Renamed: $file → $dir/index.md"
    mv "$file" "$dir/index.md"
done

echo "Build process can now proceed with VitePress."