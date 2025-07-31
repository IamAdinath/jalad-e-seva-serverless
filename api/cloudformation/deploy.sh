#!/bin/bash

function parameter_error() {
    echo "Parameter error: ${1}"
}

function validate_parameters() {
    local is_error=false

    if [ -z "$ENV" ]; then
        parameter_error "ENV"
        is_error=true
    fi

    if [ -z "$REGION" ]; then
        parameter_error "REGION"
        is_error=true
    fi

    if [ -z "$CODE_BUCKET" ]; then
        parameter_error "CODE_BUCKET"
        is_error=true
    fi

    if $is_error; then
        exit 1
    fi
}

function exist_s3_bucket() {
    local bucket_name=$1
    local region=$2
    local profile=$3
    
    aws s3api head-bucket --bucket "$bucket_name" --region "$region" --profile "$profile" 2>/dev/null
    return $?
}

function create_s3_bucket() {
    local bucket_name=$1
    local region=$2
    local profile=$3
    
    if [ "$region" == "us-east-1" ]; then
        aws s3api create-bucket --bucket "$bucket_name" --region "$region" --profile "$profile"
    else
        aws s3api create-bucket --bucket "$bucket_name" --region "$region" --create-bucket-configuration LocationConstraint="$region" --profile "$profile"
    fi
}

function deploy() {
    NOW=$(date "+%Y%m%d_%H%M%S")
    CODE_PATH="${ENV}/${NOW}"

    # Package sources and dependencies
    CODE_ZIP="portfolio.zip"
    pushd ../
    rm -rf ./cloudformation/${CODE_ZIP}
    
    pushd ./lambda

    pip3 install -r ./requirements.txt --target ./
    zip -q ../cloudformation/${CODE_ZIP} -r .
    popd

    popd

    # Prepare upload bucket
    exist_s3_bucket ${CODE_BUCKET} ${REGION} ${AWS_PROFILE} || create_s3_bucket ${CODE_BUCKET} ${REGION} ${AWS_PROFILE}

    # Upload to s3 (code)
    aws --region ${REGION} ${AWS_PROFILE_OPTION} s3 cp ../cloudformation/${CODE_ZIP} s3://${CODE_BUCKET}/${CODE_PATH}/${CODE_ZIP}

    # deploy
    aws --region ${REGION} cloudformation deploy \
    --template-file template.yaml \
    --s3-bucket ${CODE_BUCKET} \
    --s3-prefix ${CODE_PATH} \
    --stack-name ${STACK_NAME} \
    --capabilities CAPABILITY_NAMED_IAM \
    --no-fail-on-empty-changeset \
    --parameter-overrides \
    Env=${ENV} \
    CodeBucket=${CODE_BUCKET} \
    CodePath="${CODE_PATH}/${CODE_ZIP}" \
    PythonRuntime=${DEFAULT_PYTHON_RUNTIME}\
    GoogleClientId=""\
    GoogleClientSecret=""\
    LinkedInClientId=""\
    LinkedInClientSecret=""
}

validate_parameters
echo "ENV: ${ENV} parameters are valid"

echo "Started Deployment"
deploy
echo "Finished Deployment"