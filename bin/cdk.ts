#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { Tags } from 'aws-cdk-lib';

const app = new cdk.App();

// Get environment variables or use defaults
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1'
};

// Create the stack with environment configuration
const stack = new CdkStack(app, 'WebServerStack', {
  env: env,
  description: 'Web server infrastructure with VPC, subnets, and EC2 instance',
  stackName: 'web-server-stack',
});

// Add global tags to all resources
Tags.of(app).add('Project', 'WebServerDemo');
Tags.of(app).add('ManagedBy', 'CDK');
Tags.of(app).add('Owner', 'Infrastructure Team');

// Output the synthesized CloudFormation template
console.log('Synthesizing CloudFormation template...');