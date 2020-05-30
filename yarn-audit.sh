AUDIT_RESULT="$(docker run -v `pwd`:/app/ -w /app/ node:10 yarn audit --json --groups dependencies --level moderate)"
export EXIT_CODE=$?

set -e

echo "$AUDIT_RESULT" | jq .

DEPENDENCIES="$(echo "$AUDIT_RESULT" | jq .data.dependencies)"
LOW="$(echo "$AUDIT_RESULT" | jq .data.vulnerabilities.low)"
MODERATE="$(echo "$AUDIT_RESULT" | jq .data.vulnerabilities.moderate)"
HIGH="$(echo "$AUDIT_RESULT" | jq .data.vulnerabilities.high)"
CRITICAL="$(echo "$AUDIT_RESULT" | jq .data.vulnerabilities.critical)"

export GH_STATUS_DESCRIPTION="$DEPENDENCIES dependencies - Low=$LOW Moderate=$MODERATE High=$HIGH Critical=$CRITICAL"

echo "$GH_STATUS_DESCRIPTION"
