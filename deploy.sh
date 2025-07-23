#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== AWS CDK Web Server Deployment ===${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
AWS_REGION=$(aws configure get region)

if [ -z "$AWS_REGION" ]; then
    AWS_REGION="us-east-1"
    echo -e "${YELLOW}No AWS region found in config. Using default: ${AWS_REGION}${NC}"
fi

echo -e "${GREEN}AWS Account: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${GREEN}AWS Region: ${AWS_REGION}${NC}"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Build the project
echo -e "\n${YELLOW}Building the project...${NC}"
npm run build

# Check if CDK is bootstrapped
echo -e "\n${YELLOW}Checking if CDK is bootstrapped...${NC}"
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $AWS_REGION &> /dev/null; then
    echo -e "${YELLOW}CDK not bootstrapped. Bootstrapping now...${NC}"
    npx cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION
else
    echo -e "${GREEN}CDK already bootstrapped.${NC}"
fi

# Synthesize the CloudFormation template
echo -e "\n${YELLOW}Synthesizing CloudFormation template...${NC}"
npx cdk synth

# Ask for confirmation before deployment
echo -e "\n${YELLOW}Ready to deploy the stack to:${NC}"
echo -e "  Account: ${GREEN}${AWS_ACCOUNT_ID}${NC}"
echo -e "  Region:  ${GREEN}${AWS_REGION}${NC}"
read -p "Do you want to continue with the deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Deploy the stack
echo -e "\n${YELLOW}Deploying the stack...${NC}"
npx cdk deploy --require-approval never

echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}You can access your web server using the PublicIP output above.${NC}"
