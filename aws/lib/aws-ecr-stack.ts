import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class AwsEcrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    new ecr.Repository(this, "grimoire-ecr-repository-nginx", {
      repositoryName: "nginx",
    });

    new ecr.Repository(this, "grimoire-ecr-repository-grimoirelab", {
      repositoryName: "grimoirelab",
    });

    new ecr.Repository(this, "grimoire-ecr-repository-sortinghat-worker", {
      repositoryName: "sortinghat-worker",
    });

    new ecr.Repository(this, "grimoire-ecr-repository-sortinghat", {
      repositoryName: "sortinghat",
    });

    new ecr.Repository(this, "grimoire-ecr-repository-grimoire-mariadb", {
      repositoryName: "mariadb",
    });

    new ecr.Repository(this, "grimoire-ecr-repository-grimoire-redis", {
      repositoryName: "redis",
    });

    new ecr.Repository(this, "grimoire-ecr-repository-grimoire-opensearch", {
      repositoryName: "opensearch",
    });

    new ecr.Repository(this, "grimoire-ecr-repository-grimoire-opensearch-dashboards", {
      repositoryName: "opensearch-dashboards",
    });
  }
}
