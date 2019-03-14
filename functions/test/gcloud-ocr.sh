
command -v jq >/dev/null 2>&1 || { echo >&2 "'jq' JSON query tool is required but it's not installed: Visit https://stedolan.github.io/jq/"; exit 1; }

ext=${2:-png}
gcloud ml vision detect-text gs://dexpenses-207219-test-images/$1.$ext | jq -r '.responses[0].fullTextAnnotation.text' > data/$1.txt
