#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsVpcStack } from "../lib/aws-vpc-stack";
import { AwsEcrStack } from "../lib/aws-ecr-stack";
import { AwsEcsStack } from "../lib/aws-ecs-stack";

const app = new cdk.App();

//
// ECR Repository Stack
// Create ECR repository separately out of main stack to avoid unneccessary deletion
new AwsEcrStack(app, "AwsEcrStack", {
  env: { account: "927558059685", region: "eu-west-2" },
});

//
// VPC Stack separately out of main stack to avoid unneccessary deletion
const vpcStack = new AwsVpcStack(app, "AwsVpcStack", {
  env: { account: "927558059685", region: "eu-west-2" },
});

//
// ECS Stack with a cluser and tasks
new AwsEcsStack(app, "AwsEcsStack", {
  env: {
    account: "927558059685",
    region: "eu-west-2",
  },
  vpc: vpcStack.vpc,
  cluster: vpcStack.cluster,
  appLogGroup: vpcStack.appLogGroup,
});
