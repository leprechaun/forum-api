export GO_SCM_GIT_SNACKER_TRACKER_REPORTER_LABEL="c337cb33b763fb0740db433211563332b4671f62"
export GO_PIPELINE_NAME="test-pipeline"
export GO_PIPELINE_COUNTER="1"
export GO_STAGE_NAME="test-stage"
export GO_PIPELINE_COUNTER="1"
export GO_JOB_NAME="test-job"


function finish {
  EXIT_CODE=$?
  set +e

  docker run -v `pwd`:/tmp/mount alpine chown -R $(id -u):$(id -g) /tmp/mount

  ./auto/clean-up || true

   [[ $EXIT_CODE = 0 ]] && GH_STATUS="success" || GH_STATUS="failure"

  bash auto/push-commit-status \
    snacker-tracker/reporter \
    ${GO_SCM_GIT_SNACKER_TRACKER_REPORTER_LABEL} \
    $GH_STATUS "${GH_STATUS_DESCRIPTION}"

  exit $EXIT_CODE
}

trap finish EXIT

./auto/lint
EXIT_CODE=$?

[[ $EXIT_CODE = 0 ]] && GH_STATUS_DESCRIPTION="No linting errors" || GH_STATUS_DESCRIPTION="There are linting errors"
exit $EXIT_CODE

