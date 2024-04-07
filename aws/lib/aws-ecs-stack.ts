import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from "aws-cdk-lib/aws-logs";

interface AwsEcsStackProps extends cdk.StackProps {
  readonly vpc: ec2.Vpc;
  readonly cluster: ecs.Cluster;
  readonly appLogGroup: logs.ILogGroup;
}

export class AwsEcsStack extends cdk.Stack {
  private readonly ecsService: ecs.FargateService;
  private readonly ecsService2: ecs.FargateService;
  private readonly ecsService3: ecs.FargateService;
  private readonly ecsService4: ecs.FargateService;
  private readonly ecsService5: ecs.FargateService;

  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & AwsEcsStackProps
  ) {
    super(scope, id, props);

    //
    // Service Connect Security Groups
    const securityGroup = new ec2.SecurityGroup(
      this,
      "sortinghat-security-group",
      {
        securityGroupName: "grimoire-sortinghat-security-group",
        vpc: props.vpc,
      }
    );
    securityGroup.addIngressRule(securityGroup, ec2.Port.tcp(9314));
    securityGroup.addIngressRule(securityGroup, ec2.Port.tcp(3306));
    securityGroup.addIngressRule(securityGroup, ec2.Port.tcp(6379));
    securityGroup.addIngressRule(securityGroup, ec2.Port.tcp(8000));
    securityGroup.addIngressRule(securityGroup, ec2.Port.tcp(5601));
    securityGroup.addIngressRule(securityGroup, ec2.Port.tcp(9200));
    securityGroup.addIngressRule(securityGroup, ec2.Port.tcp(9600));

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
        securityGroups: securityGroup.connections.securityGroups,
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
        securityGroups: securityGroup.connections.securityGroups,
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
        securityGroups: securityGroup.connections.securityGroups,
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
      containerName: this.resourceName("grimoire-nginx"),
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(
          this,
          "grimoire-nginx",
          "grimoire-nginx"
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
        securityGroups: securityGroup.connections.securityGroups,
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
        ecr.Repository.fromRepositoryName(this, "grimoire-morded", "grimoirelab"),
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
        securityGroups: securityGroup.connections.securityGroups,
        circuitBreaker: { enable: true, rollback: false },
      }
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
