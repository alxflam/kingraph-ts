#! /bin/bash

script_dir=$(dirname "$0")
echo "Script directory: $script_dir"
repo_root=$(cd "$script_dir/.." && pwd)
echo "Repository root: $repo_root"
kingraph="$repo_root/kingraph"
echo "Kingraph path: $kingraph"


# iterate over every yaml file in the script directory
for file in $"$script_dir"/*.yaml; do
    filename=$(basename "$file")
    echo "Processing file: $filename"
    name="${filename%.*}"
    echo "Output name: $name.svg"

    "$kingraph" kingraph --yaml $file --format svg --theme light > $script_dir/$name.svg
    if [ $? -ne 0 ]; then
      echo "SVG generation failed for: $filename"
      exit 1
    fi

    echo "SVG generation succeeded for: $filename"
done
