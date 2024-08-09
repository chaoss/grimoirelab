# Running GrimoireLab with AWS Fargate

In this folder are configuration files for deploying GrimoireLab using [AWS](https://aws.amazon.com). You will need a functional AWS account and you should be able to deploy that AWS account. This setup uses [AWS Fargate](https://aws.amazon.com/fargate) with a Network Load Balancer.

## Requirements

- [Node.js 20.10.0+](https://nodejs.org/en/download)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- [AWS credentials configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
- Docker Images built for GrimoireLab (Mordred), NGINX, Sorting Hat Working, Sorting Hat, MariaDB, Redis, OpenSearch, and OpenSearch Dashboards.

## Limitations

- This setup relies on all configuration files (e.g., default-grimoirelab-settings/projects.json) being included in the Docker Images. This configuration has not been setup for EFS volume mounts or the use of AWS S3.

## Getting Started

### Install

```bash
cd aws
npm install
npm run build
```

### Setup environmental variables for your account and region

| Variable             | Value                                       |
| -------------------- | ------------------------------------------- |
| GRIMOIRE_AWS_ACCOUNT | Your AWS account                            |
| GRIMOIRE_AWS_REGION  | Your preferred AWS region (e.g., eu-west-2) |

### Bootstrap CDK

```bash
npx cdk bootstrap aws://${GRIMOIRE_AWS_ACCOUNT}/${GRIMOIRE_AWS_REGION}
```

### Docker Images

#### Setup your AWS registry

```bash
npx cdk deploy AwsEcrStack
```

#### Login to your AWS registry

```bash
aws ecr get-login-password --region ${GRIMOIRE_AWS_REGION} | docker login --username AWS --password-stdin ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/grimoirelab
```

#### Push Images to your AWS registry

```bash
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/grimoirelab:latest
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/nginx:latest
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/sortinghat-working:latest
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/sortinghat:latest
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/mariadb:latest
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/redis:latest
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/opensearch:1.3.7
docker push ${GRIMOIRE_AWS_ACCOUNT}.dkr.ecr.${GRIMOIRE_AWS_REGION}.amazonaws.com/opensearch-dashboards:1.3.7
```

### Deploy the AWS stacks

```bash
npx cdk deploy AwsVpcStack
npx cdk deploy AwsEcsRedisStack
npx cdk deploy AwsEcsOpenSearchStack
npx cdk deploy AwsEcsSortingHatStack
npx cdk deploy AwsEcsMordredStack
npx cdk deploy AwsNlbStack
```

## Test the AWS stack deployment

Visit the AWS Load balancers website, select grimoire-nlb, and visit the DNS name in your browser (e.g., `grimoire-nlb-2ffec2c2fc78664d.elb.eu-west-2.amazonaws.com`).

## Improvements

1. Setup RDS in place of mariadb service.
2. Setup EFS to store configuration files and store indices.
