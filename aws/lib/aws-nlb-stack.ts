import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

interface AwsNlbStackProps extends cdk.StackProps {
  readonly vpc: ec2.Vpc;
  readonly cluster: ecs.Cluster;
  readonly appLogGroup: logs.ILogGroup;
  readonly theTaskDefinition: ecs.FargateService;
  readonly theTaskDefinitionContainerName: string;
  readonly theTaskDefinitionPort: number;
}

export class AwsNlbStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & AwsNlbStackProps
  ) {
    super(scope, id, props);

    //
    // Create new NLB security group
    const nlbSecurityGroup = new ec2.SecurityGroup(this, "network-lb-sg", {
      vpc: props.vpc,
    });

    //
    // Create the NLB using the VPC.
    const nlb = new elbv2.NetworkLoadBalancer(this, this.resourceName("nlb"), {
      loadBalancerName: this.resourceName("nlb"),
      vpc: props.vpc,
      securityGroups: [nlbSecurityGroup],
      internetFacing: true, // Load Balancer available externally
    });

    //
    // ALERT!! Allow from everywhere!!
    nlb.connections.allowFrom(ec2.Peer.ipv4("0.0.0.0/0"), ec2.Port.tcp(5601));

    //
    // Add a listener on a particular port for the NLB
    const listener = nlb.addListener(this.resourceName("nlb-listener"), {
      port: props.theTaskDefinitionPort,
    });

    listener.addTargets(this.resourceName("nlb-tg"), {
      targetGroupName: this.resourceName("nlb-tg"),
      port: props.theTaskDefinitionPort,
      targets: [
        props.theTaskDefinition.loadBalancerTarget({
          containerName: this.resourceName(
            props.theTaskDefinitionContainerName
          ),
          containerPort: props.theTaskDefinitionPort,
        }),
      ],
      deregistrationDelay: cdk.Duration.seconds(300),
      healthCheck: {
        protocol: elbv2.Protocol.TCP,
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(5),
      },
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
