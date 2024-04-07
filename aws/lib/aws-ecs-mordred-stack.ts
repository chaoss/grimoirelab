import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from "aws-cdk-lib/aws-logs";

interface AwsEcsMordredStackProps extends cdk.StackProps {
  readonly vpc: ec2.Vpc;
  readonly cluster: ecs.Cluster;
  readonly appLogGroup: logs.ILogGroup;
  readonly securityGroup: ec2.SecurityGroup;
}

export class AwsEcsMordredStack extends cdk.Stack {
  public readonly ecsService5: ecs.FargateService;

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & AwsEcsMordredStackProps
  ) {
    super(scope, id, props);

    //
    // Task Definition for ECS fargate service running the mordred application
    const taskDefinition5 = new ecs.TaskDefinition(
      this,
      "grimoire-app-mordred-task-definition",
      {
        cpu: "256",
        memoryMiB: "512",
        compatibility: ecs.Compatibility.FARGATE,
      }
    );

    taskDefinition5.addContainer("grimoire-app-mordred-container", {
      containerName: this.resourceName("mordred"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "grimoire-morded",
          "grimoirelab"
        ),
        "latest"
      ),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "grimoire-mordred",
      }),
    });

    this.ecsService5 = new ecs.FargateService(
      this,
      "grimoire-app-mordred-mordred-service",
      {
        cluster: props.cluster,
        propagateTags: ecs.PropagatedTagSource.SERVICE,
        serviceName: this.resourceName("mordred"),
        taskDefinition: taskDefinition5,
        vpcSubnets: this.privateSubnetSelection(props.vpc),
        assignPublicIp: false,
        enableExecuteCommand: true,
        securityGroups: props.securityGroup.connections.securityGroups,
        circuitBreaker: { enable: true, rollback: false },
      }
    );

    this.ecsService5.enableServiceConnect({
      services: [],
      namespace: props.cluster.defaultCloudMapNamespace?.namespaceName,
    });
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
