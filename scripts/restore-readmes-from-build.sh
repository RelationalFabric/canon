#!/bin/bash

# Restore index.md files back to README.md after VitePress build
# Restores index.md files repository-wide except .vitepress

echo "Starting index.md → README.md restore after VitePress build..."

# Find and restore index.md files, excluding .vitepress directory
find . -name "index.md" \
  -not -path "./.vitepress/*" \
  -not -path "./node_modules/*" \
  | while read file; do
    dir=$(dirname "$file")
    # Do not clobber the project root index.md (site landing page)
    if [ "$file" = "./index.md" ]; then
      continue
    fi
    echo "Restored: $file → $dir/README.md"
    mv "$file" "$dir/README.md"
done

echo "Repository is now ready for GitHub editing."