TABLE=${1?Table must be set}
JOIN_ID=${2?Join column must be set}
PROJECT=$(cat .firebaserc | jq -r '.projects.default')
DATASET="dexpenses_bi"
MAX_SQL="select max(m.bq_inserted_at) from \`$PROJECT\`.$DATASET.$TABLE m \
  where m.user_id = r.user_id and m.$JOIN_ID = r.$JOIN_ID"
VIEW_SQL="select * from \`$PROJECT\`.$DATASET.$TABLE r \
  where r.bq_inserted_at = ($MAX_SQL) and r.bq_op <> 'D'"

echo "Creating view as..."
echo "$VIEW_SQL"

bq mk --use_legacy_sql=false --description "View of table '$TABLE' that contains only the latest valid rows" \
  --view "$VIEW_SQL" --project_id $PROJECT $DATASET.actual_$TABLE
