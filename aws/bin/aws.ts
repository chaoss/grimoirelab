#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsVpcStack } from "../lib/aws-vpc-stack";
import { AwsEcrStack } from "../lib/aws-ecr-stack";
import { AwsEcsRedisStack } from "../lib/aws-ecs-redis-stack";
import { AwsEcsOpenSearchStack } from "../lib/aws-ecs-opensearch-stack";
import { AwsEcsMordredStack } from "../lib/aws-ecs-mordred-stack";
import { AwsEcsSortingHatStack } from "../lib/aws-ecs-sortinghat-stack";
import { AwsNlbStack } from "../lib/aws-nlb-stack";

const app = new cdk.App();

//
// Environment variables
// Should be set in local environment or workflows before running `cdk` commands
const { GRIMOIRE_AWS_ACCOUNT, GRIMOIRE_AWS_REGION } = process.env;

//
// ECR Repository Stack
// Create ECR repository separated out of main stack to avoid unneccessary deletion
new AwsEcrStack(app, "AwsEcrStack", {
  env: { account: `${GRIMOIRE_AWS_ACCOUNT}`, region: `${GRIMOIRE_AWS_REGION}` },
});

//
// VPC Stack separated out of main stack to avoid unneccessary deletion
const vpcStack = new AwsVpcStack(app, "AwsVpcStack", {
  env: { account: `${GRIMOIRE_AWS_ACCOUNT}`, region: `${GRIMOIRE_AWS_REGION}` },
});

//
// ECS Stack with a cluser and tasks for redis
new AwsEcsRedisStack(app, "AwsEcsRedisStack", {
  env: { account: `${GRIMOIRE_AWS_ACCOUNT}`, region: `${GRIMOIRE_AWS_REGION}` },
  vpc: vpcStack.vpc,
  cluster: vpcStack.cluster,
  appLogGroup: vpcStack.appLogGroup,
  securityGroup: vpcStack.securityGroup,
});

//
// ECS Stack with a cluser and tasks for opensearch
const openSearchStack = new AwsEcsOpenSearchStack(
  app,
  "AwsEcsOpenSearchStack",
  {
    env: {
      account: `${GRIMOIRE_AWS_ACCOUNT}`,
      region: `${GRIMOIRE_AWS_REGION}`,
    },
    vpc: vpcStack.vpc,
    cluster: vpcStack.cluster,
    appLogGroup: vpcStack.appLogGroup,
    securityGroup: vpcStack.securityGroup,
  }
);

//
// ECS Stack with a cluser and tasks for sortinghat
new AwsEcsSortingHatStack(app, "AwsEcsSortingHatStack", {
  env: { account: `${GRIMOIRE_AWS_ACCOUNT}`, region: `${GRIMOIRE_AWS_REGION}` },
  vpc: vpcStack.vpc,
  cluster: vpcStack.cluster,
  appLogGroup: vpcStack.appLogGroup,
  securityGroup: vpcStack.securityGroup,
});

//
// ECS Stack with a cluser and tasks for mordred
new AwsEcsMordredStack(app, "AwsEcsMordredStack", {
  env: { account: `${GRIMOIRE_AWS_ACCOUNT}`, region: `${GRIMOIRE_AWS_REGION}` },
  vpc: vpcStack.vpc,
  cluster: vpcStack.cluster,
  appLogGroup: vpcStack.appLogGroup,
  securityGroup: vpcStack.securityGroup,
});

//
// NLB Stack separated out of main stack to avoid unnecessary deletion
new AwsNlbStack(app, "AwsNlbStack", {
  env: { account: `${GRIMOIRE_AWS_ACCOUNT}`, region: `${GRIMOIRE_AWS_REGION}` },
  vpc: vpcStack.vpc,
  cluster: vpcStack.cluster,
  appLogGroup: vpcStack.appLogGroup,
  //
  // Connect Network Load Balancer to OpenSearch
  theTaskDefinition: openSearchStack.ecsService4,
  theTaskDefinitionContainerName: "opensearch-dashboards",
  theTaskDefinitionPort: 5601,
});
