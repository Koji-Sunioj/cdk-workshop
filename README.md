# Notes from Koji

This started as a small, casual project to learn how to integrate AWS resources with front-end using AWS CDK. It has now been refactored using Typescript and Redux to showcase my learnings.

link to website: https://d1yh66sadgwb8n.cloudfront.net/ 

Features include:

- Running a build to an S3 bucket with Cloudflare distribution, which updates when build is updated
- Handling multiple Api Gateway paths, methods and request patterns
- Configuring authentication to client via lambda / api gateway, using permissions, environment variables and AWS SDK to perform actions
- Performing Crud operations via lambda / api gateway to and from Dynamodb and client
- Understanding Dynamodb syntax, expressions and schema design

# Welcome to your CDK TypeScript project

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
