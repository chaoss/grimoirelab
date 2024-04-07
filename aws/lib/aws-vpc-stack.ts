import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as logs from "aws-cdk-lib/aws-logs";

export class AwsVpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;
  public readonly tokenSecrets: secretsmanager.ISecret;
  public readonly rdsSecrets: secretsmanager.ISecret;
  public readonly appLogGroup: logs.ILogGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //
    // Secrets Manager
    // Import existing secrets
    this.tokenSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      "grimoire-secrets-manager-tokens",
      `/dev/grimoire/tokens`
    );
    this.rdsSecrets = secretsmanager.Secret.fromSecretNameV2(
      this,
      "grimoire-secrets-manager-postgresql",
      `/dev/grimoire/postgresql`
    );

    //
    // VPC
    this.vpc = new ec2.Vpc(this, "grimoire-vpc", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      vpcName: this.resourceName("vpc"),
      maxAzs: 2,
      natGateways: 1, // NAT Gateways are needed since the private subnet will communicate with the internet
      enableDnsSupport: true, // Is needed for VPC Endpoints
      enableDnsHostnames: true,
      subnetConfiguration: [
        {
          name: this.resourceName("vpc-public"),
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: this.resourceName("vpc-private"),
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    //
    // VPC Endpoints to access AWS services from the private subnet
    //
    // One Security Group to use across all new VPC Endpoints
    // A list of AWS services for which we need to create VPC Endpoints
    this.createVpcEndpoints({
      "ecr-api": ec2.InterfaceVpcEndpointAwsService.ECR,
      "ecr-dkr": ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      cwl: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      sm: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });

    // Gateway VPC Endpoint for S3 is needed to pull images from ECR
    new ec2.GatewayVpcEndpoint(this, "grimoire-vpc-private-endpoint-s3", {
      vpc: this.vpc,
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [this.privateSubnetSelection()],
    });

    //
    // CloudWatch Log Group
    this.appLogGroup = this.optionallyCreateLogGroup("/grimoire/dev/app-logs");

    //
    // Create the cluster
    this.cluster = new ecs.Cluster(this, "grimoire-cluster", {
      clusterName: this.resourceName("cluster"),
      vpc: this.vpc,
    });

    this.cluster.addDefaultCloudMapNamespace({
      name: "grimoire.app.namespace",
      vpc: this.vpc,
      useForServiceConnect: true,
    });
  }

  // resourceName is a common method for AWS resource naming
  private resourceName(name: string): string {
    return `grimoire-${name}`;
  }

  // privateSubnetSelection returns a selection of subnets in the vpc with type PRIVATE
  private privateSubnetSelection() {
    return this.vpc.selectSubnets({
      subnetGroupName: this.resourceName("vpc-private"),
    });
  }

  // createVpcEndpoints iterates over a list of AWS services and creates VPC endpoints to access them
  private createVpcEndpoints(vpcEndpointsToCreate: {
    [key: string]: ec2.InterfaceVpcEndpointAwsService;
  }) {
    const sgVpcEndpoint = new ec2.SecurityGroup(
      this,
      "grimoire-vpc-private-endpoint-sg",
      {
        vpc: this.vpc,
        allowAllOutbound: true,
      }
    );
    sgVpcEndpoint.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(443),
      "Allow access to VPC endpoints"
    );
    for (const id in vpcEndpointsToCreate) {
      new ec2.InterfaceVpcEndpoint(
        this,
        `grimoire-vpc-private-endpoint-${id}`,
        {
          vpc: this.vpc,
          service: vpcEndpointsToCreate[id],
          securityGroups: [sgVpcEndpoint],
          subnets: this.privateSubnetSelection(),
          privateDnsEnabled: true,
        }
      );
    }
  }

  // Once the Log Group is created, the deletion can be done only manually.
  // So check if it exists before trying to create it.
  private optionallyCreateLogGroup(logGroupName: string): logs.ILogGroup {
    let logGroup: logs.ILogGroup;
    try {
      logGroup = logs.LogGroup.fromLogGroupName(
        this,
        "app-log-group",
        logGroupName
      );
    } catch {
      logGroup = new logs.LogGroup(this, "app-log-group", {
        logGroupName,
        retention: logs.RetentionDays.THREE_MONTHS,
      });
    }

    return logGroup;
  }
}
