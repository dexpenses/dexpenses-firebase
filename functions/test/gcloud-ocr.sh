
command -v jq >/dev/null 2>&1 || { echo >&2 "'jq' JSON query tool is required but it's not installed: Visit https://stedolan.github.io/jq/"; exit 1; }

gcloud ml vision detect-text $1 | jq -r '.responses[0].fullTextAnnotation.text'
