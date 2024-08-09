import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from "aws-cdk-lib/aws-logs";

interface AwsEcsSortingHatStackProps extends cdk.StackProps {
  readonly vpc: ec2.Vpc;
  readonly cluster: ecs.Cluster;
  readonly appLogGroup: logs.ILogGroup;
  readonly securityGroup: ec2.SecurityGroup;
}

export class AwsEcsSortingHatStack extends cdk.Stack {
  public readonly ecsService3: ecs.FargateService;

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & AwsEcsSortingHatStackProps
  ) {
    super(scope, id, props);

    //
    // Task Definition for ECS fargate service running the sortinghat and nginx applications
    const taskDefinition3 = new ecs.TaskDefinition(
      this,
      "grimoire-app-sortinghat-task-definition",
      {
        cpu: "512",
        memoryMiB: "2048",
        compatibility: ecs.Compatibility.FARGATE,
      }
    );

    taskDefinition3.addContainer("grimoire-app-sortinghat-container", {
      containerName: this.resourceName("sortinghat"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "grimoire-sortinghat",
          "sortinghat"
        ),
        "latest"
      ),
      essential: true,
      portMappings: [
        {
          containerPort: 9314,
          hostPort: 9314,
          name: "sortinghat",
        },
      ],
      environment: {
        SORTINGHAT_SECRET_KEY: "secret",
        SORTINGHAT_DB_HOST: "mariadb",
        SORTINGHAT_DB_PORT: "3306",
        SORTINGHAT_DB_DATABASE: "sortinghat_db",
        SORTINGHAT_DB_USER: "root",
        SORTINGHAT_DB_PASSWORD: "",
        SORTINGHAT_REDIS_HOST: "redis",
        SORTINGHAT_REDIS_PORT: "6379",
        SORTINGHAT_REDIS_PASSWORD: "",
        SORTINGHAT_SUPERUSER_USERNAME: "root",
        SORTINGHAT_SUPERUSER_PASSWORD: "root",
        SORTINGHAT_ALLOWED_HOST: "sortinghat,nginx,localhost,127.0.0.1,[::1]",
        SORTINGHAT_CORS_ALLOWED_ORIGINS:
          "http://localhost:8000,http://127.0.0.1:8000",
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "grimoire-sortinghat",
      }),
    });

    taskDefinition3.addContainer("grimoire-app-sortinghat-worker-container", {
      containerName: this.resourceName("sortinghat-worker"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "grimoire-sortinghat-worker",
          "sortinghat-worker"
        ),
        "latest"
      ),
      essential: true,
      environment: {
        SORTINGHAT_SECRET_KEY: "secret",
        SORTINGHAT_DB_HOST: "mariadb",
        SORTINGHAT_DB_PORT: "3306",
        SORTINGHAT_DB_DATABASE: "sortinghat_db",
        SORTINGHAT_DB_USER: "root",
        SORTINGHAT_DB_PASSWORD: "",
        SORTINGHAT_REDIS_HOST: "redis",
        SORTINGHAT_REDIS_PORT: "6379",
        SORTINGHAT_REDIS_PASSWORD: "",
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "grimoire-sortinghat-worker",
      }),
    });

    taskDefinition3.addContainer("grimoire-app-grimoire-nginx-container", {
      containerName: this.resourceName("nginx"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "grimoire-nginx",
          "nginx"
        ),
        "latest"
      ),
      essential: true,
      portMappings: [
        {
          containerPort: 8000,
          hostPort: 8000,
          name: "nginx",
        },
      ],
      environment: {
        KIBANA_HOST: "http://opensearch-dashboards:5601/",
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup: props.appLogGroup,
        streamPrefix: "grimoire-nginx",
      }),
      healthCheck: {
        command: [
          "CMD-SHELL",
          "curl -s --head http://localhost:8000/identities/api/ | grep Set-Cookie || exit 1",
        ],
        retries: 1,
      },
    });

    this.ecsService3 = new ecs.FargateService(
      this,
      "grimoire-app-ecs-sortinghat-service",
      {
        cluster: props.cluster,
        propagateTags: ecs.PropagatedTagSource.SERVICE,
        serviceName: this.resourceName("sortinghat"),
        taskDefinition: taskDefinition3,
        vpcSubnets: this.privateSubnetSelection(props.vpc),
        assignPublicIp: false,
        enableExecuteCommand: true,
        securityGroups: props.securityGroup.connections.securityGroups,
        circuitBreaker: { enable: true, rollback: false },
      }
    );

    this.ecsService3.enableServiceConnect({
      services: [
        {
          discoveryName: "sortinghat",
          portMappingName: "sortinghat",
          dnsName: "sortinghat",
          port: 9314,
        },
        {
          discoveryName: "nginx",
          portMappingName: "nginx",
          dnsName: "nginx",
          port: 8000,
        },
      ],
      namespace: props.cluster.defaultCloudMapNamespace?.namespaceName,
    });

    this.ecsService3.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(9314)
    );
    this.ecsService3.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(8000)
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
