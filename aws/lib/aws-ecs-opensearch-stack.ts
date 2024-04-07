import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from "aws-cdk-lib/aws-logs";

interface AwsEcsOpenSearchStackProps extends cdk.StackProps {
  readonly vpc: ec2.Vpc;
  readonly cluster: ecs.Cluster;
  readonly appLogGroup: logs.ILogGroup;
  readonly securityGroup: ec2.SecurityGroup;
}

export class AwsEcsOpenSearchStack extends cdk.Stack {
  public readonly ecsService4: ecs.FargateService;

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & AwsEcsOpenSearchStackProps
  ) {
    super(scope, id, props);

    //
    // OpenSearch Dashboards
    const taskDefinition4 = new ecs.TaskDefinition(
      this,
      "opensearch-node1-task-definition",
      {
        cpu: "512",
        memoryMiB: "4096",
        family: "opensearch-node1",
        compatibility: ecs.Compatibility.FARGATE,
      }
    );

    taskDefinition4.addContainer("opensearch-node1", {
      containerName: this.resourceName("opensearch-node1"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "grimoire-opensearch",
          "opensearch"
        ),
        "1.3.7"
      ),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "opensearch-node1",
      }),
      portMappings: [
        {
          containerPort: 9200,
          name: "opensearch-node-1-9200",
          hostPort: 9200,
        },
        {
          containerPort: 9600,
          name: "opensearch-node-1-9600",
          hostPort: 9600,
        },
      ],
      environment: {
        "cluster.name": "opensearch-cluster",
        "node.name": "opensearch-node1",
        "discovery.type": "single-node",
        "bootstrap.memory_lock": "true",
        OPENSEARCH_JAVA_OPTS: "-Xms2g -Xmx2g",
        OPENSEARCH_INITIAL_ADMIN_PASSWORD: "Metrics@123",
      },
    });

    taskDefinition4.addContainer("opensearch-dashboards", {
      containerName: this.resourceName("opensearch-dashboards"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "grimoire-opensearch-dashboards",
          "opensearch-dashboards"
        ),
        "1.3.7"
      ),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "opensearch-dashboards",
      }),
      portMappings: [
        {
          containerPort: 5601,
          name: "opensearch-dashboards",
          hostPort: 5601,
        },
      ],
      environment: {
        OPENSEARCH_HOSTS: '["https://opensearch-node-1-9200:9200"]',
      },
    });

    this.ecsService4 = new ecs.FargateService(
      this,
      "grimoire-app-ecs-opensearch-service",
      {
        cluster: props.cluster,
        propagateTags: ecs.PropagatedTagSource.SERVICE,
        serviceName: this.resourceName("opensearch"),
        taskDefinition: taskDefinition4,
        vpcSubnets: this.privateSubnetSelection(props.vpc),
        assignPublicIp: false,
        enableExecuteCommand: true,
        securityGroups: props.securityGroup.connections.securityGroups,
        circuitBreaker: { enable: true, rollback: false },
      }
    );

    this.ecsService4.enableServiceConnect({
      services: [
        {
          discoveryName: "opensearch-node-1-9200",
          portMappingName: "opensearch-node-1-9200",
          dnsName: "opensearch-node-1-9200",
          port: 9200,
        },
        {
          discoveryName: "opensearch-node-1-9600",
          portMappingName: "opensearch-node-1-9600",
          dnsName: "opensearch-node-1-9600",
          port: 9600,
        },
        {
          discoveryName: "opensearch-dashboards",
          portMappingName: "opensearch-dashboards",
          dnsName: "opensearch-dashboards",
          port: 5601,
        },
      ],
      namespace: props.cluster.defaultCloudMapNamespace?.namespaceName,
    });

    this.ecsService4.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(9200)
    );
    this.ecsService4.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(9600)
    );
    this.ecsService4.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(5601)
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
