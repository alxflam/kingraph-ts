#! /bin/bash

script_dir=$(dirname "$0")
kingraph="$script_dir/../out/index.js"

# iterate over every yaml file in the script directory
for file in $(dirname $0)/*.yaml; do
    filename=$(basename "$file")
    name="${filename%.*}"

    "$kingraph" -y $file -f svg > $name.svg
    if [ $? -ne 0 ]; then
      echo "SVG generation failed for: $filename"
      exit 1
    fi

    echo "SVG generation succeeded for: $filename"
done