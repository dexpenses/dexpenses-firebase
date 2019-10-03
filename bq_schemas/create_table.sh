TABLE=${1?Table must be set}
PROJECT=$(cat .firebaserc | jq -r '.projects.default')
DATASET="dexpenses_bi"

bq mk \
--table \
$PROJECT:$DATASET.$TABLE \
bq_schemas/$TABLE.json
