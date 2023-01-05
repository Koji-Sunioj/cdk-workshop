import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

//s3 and cloud front deployment imports
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CacheControl } from "aws-cdk-lib/aws-s3-deployment";

import * as cognito from "aws-cdk-lib/aws-cognito";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      signInAliases: { email: true }, // Set email as an alias
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: false,
        requireSymbols: false,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      authFlows: {
        userPassword: true,
      },
      userPool,
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    });

    //s3 and cloud front deployment constructors
    const bucket = new Bucket(this, "Bucket", {
      accessControl: BucketAccessControl.PRIVATE,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    bucket.grantRead(originAccessIdentity);

    const distribution = new Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity }),
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    new BucketDeployment(this, "BucketDeployment", {
      sources: [
        Source.asset(path.resolve(__dirname, "../website/tests3/build")),
      ],
      cacheControl: [CacheControl.fromString("max-age=3000,public,immutable")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    //table constructor
    const table = new dynamodb.Table(this, "Albums", {
      partitionKey: { name: "albumId", type: dynamodb.AttributeType.STRING },
    });

    //lambda constructor
    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
      environment: {
        ALBUM_TABLE_NAME: table.tableName,
      },
    });

    //permission for lambda to invoke table ops
    table.grantReadWriteData(hello);

    //api gateway constructor
    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
      proxy: false,
    });

    //creating paths and methods for api
    const albums = api.root.addResource("albums");
    albums.addMethod("GET");
    albums.addMethod("POST");

    const album = albums.addResource("{albumId}");
    album.addMethod("GET");
    album.addMethod("DELETE");
    album.addMethod("PATCH");

    const signUp = new lambda.Function(this, "SignUpHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "signup.handler",
      environment: {
        USER_POOL_CLIENT: userPoolClient.userPoolClientId,
      },
    });

    //api gateway constructor
    const signUpapi = new apigw.LambdaRestApi(this, "SignUpEndpoint", {
      handler: signUp,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });

    const auth = signUpapi.root.addResource("auth");
    auth.addMethod("POST");
    //creating paths and methods for api
    const newAuth = signUpapi.root.addResource("sign-up");
    newAuth.addMethod("POST");
    newAuth.addMethod("PATCH");
  }
}
