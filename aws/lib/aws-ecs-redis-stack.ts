import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from "aws-cdk-lib/aws-logs";

interface AwsEcsRedisStackProps extends cdk.StackProps {
  readonly vpc: ec2.Vpc;
  readonly cluster: ecs.Cluster;
  readonly appLogGroup: logs.ILogGroup;
  readonly securityGroup: ec2.SecurityGroup;
}

export class AwsEcsRedisStack extends cdk.Stack {
  public readonly ecsService: ecs.FargateService;
  public readonly ecsService2: ecs.FargateService;

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & AwsEcsRedisStackProps
  ) {
    super(scope, id, props);

    //
    // Task Definition for ECS fargate service running the maria db application
    const taskDefinition = new ecs.TaskDefinition(
      this,
      "grimoire-app-mariadb-task-definition",
      {
        cpu: "256",
        memoryMiB: "512",
        compatibility: ecs.Compatibility.FARGATE,
      }
    );

    taskDefinition.addContainer("grimoire-app-mariadb-container", {
      containerName: this.resourceName("mariadb"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(this, "grimoire-mariadb", "mariadb"),
        "latest"
      ),
      essential: true,
      portMappings: [
        {
          containerPort: 3306,
          hostPort: 3306,
          name: "mariadb",
        },
      ],
      environment: {
        MYSQL_ROOT_PASSWORD: "",
        MYSQL_ALLOW_EMPTY_PASSWORD: "yes",
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "grimoire-mariadb",
      }),
      healthCheck: {
        command: [
          "CMD",
          "/usr/local/bin/healthcheck.sh",
          "--su=root",
          "--connect",
          "--innodb_initialized",
        ],
        retries: 1,
      },
    });

    this.ecsService = new ecs.FargateService(
      this,
      "grimoire-app-ecs-mariadb-service",
      {
        cluster: props.cluster,
        propagateTags: ecs.PropagatedTagSource.SERVICE,
        serviceName: this.resourceName("mariadb"),
        taskDefinition: taskDefinition,
        vpcSubnets: this.privateSubnetSelection(props.vpc),
        assignPublicIp: false,
        enableExecuteCommand: true,
        securityGroups: props.securityGroup.connections.securityGroups,
        circuitBreaker: { enable: true, rollback: false },
      }
    );

    this.ecsService.enableServiceConnect({
      services: [
        {
          discoveryName: "mariadb",
          portMappingName: "mariadb",
          dnsName: "mariadb",
          port: 3306,
        },
      ],
      namespace: props.cluster.defaultCloudMapNamespace?.namespaceName,
    });

    this.ecsService.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(3306)
    );

    //
    // Task Definition for ECS fargate service running the redis application
    const taskDefinition2 = new ecs.TaskDefinition(
      this,
      "grimoire-app-redis-task-definition",
      {
        cpu: "256",
        memoryMiB: "512",
        compatibility: ecs.Compatibility.FARGATE,
      }
    );

    taskDefinition2.addContainer("grimoire-app-redis-container", {
      containerName: this.resourceName("redis"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(this, "grimoire-redis", "redis"),
        "latest"
      ),
      essential: true,
      portMappings: [
        {
          containerPort: 6379,
          hostPort: 6379,
          name: "redis",
        },
      ],
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "grimoire-redis",
      }),
      healthCheck: {
        command: ["CMD", "redis-cli", "--raw", "incr", "ping"],
        retries: 1,
      },
    });

    this.ecsService2 = new ecs.FargateService(
      this,
      "grimoire-app-ecs-redis-service",
      {
        cluster: props.cluster,
        propagateTags: ecs.PropagatedTagSource.SERVICE,
        serviceName: this.resourceName("redis"),
        taskDefinition: taskDefinition2,
        vpcSubnets: this.privateSubnetSelection(props.vpc),
        assignPublicIp: false,
        enableExecuteCommand: true,
        securityGroups: props.securityGroup.connections.securityGroups,
        circuitBreaker: { enable: true, rollback: false },
      }
    );

    this.ecsService2.enableServiceConnect({
      services: [
        {
          discoveryName: "redis",
          portMappingName: "redis",
          dnsName: "redis",
          port: 6379,
        },
      ],
      namespace: props.cluster.defaultCloudMapNamespace?.namespaceName,
    });

    this.ecsService2.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(6379)
    );
  }

  // resourceName is a common method for AWS resource naming
  private resourceName(name: string): string {
    return `grimoire-${name}`;
  }

  // privateSubnetSelection returns a selection of subnets in the vpc with type PRIVATE
  private privateSubnetSelection(vpc: ec2.Vpc) {
    return vpc.selectSubnets({
      subnetGroupName: this.resourceName("vpc-private"),
    });
  }
}
