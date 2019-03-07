
gcloud ml vision detect-text $1 | jq -r '.responses[0].fullTextAnnotation.text'
