import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

//s3 and cloud front deployment imports
import * as path from "path";
import {
  CacheControl,
  BucketDeployment,
  Source,
} from "aws-cdk-lib/aws-s3-deployment";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* self sign up allows user to register on their own. autoverify is for 
    confirmation code. sign in alias is when email used as username. custom 
    password policy */
    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: false,
        requireSymbols: false,
      },
    });

    /* need to specify the type of user registration, in our case is username 
   and password. user pool client acts on behalf of user pool in app */
    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      authFlows: {
        userPassword: true,
      },
      userPool,
      generateSecret: false,
    });

    //s3 and cloud front deployment constructors
    const bucket = new Bucket(this, "Bucket", {
      accessControl: BucketAccessControl.PRIVATE,
    });

    //allows cloud front to access s3 bucket
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    //the file for cloudfront to serve in s3. need error for react routing
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

    // cache control and distribution pat needed when updating the build folder
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

    // user pool client needed for user signups, pool id for admin actions
    const signUp = new lambda.Function(this, "SignUpHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "signup.handler",
      environment: {
        USER_POOL_CLIENT: userPoolClient.userPoolClientId,
        USER_POOL_ID: userPool.userPoolId,
      },
    });

    /* this is needed for admin actions in aws-sdk in cognito pool. arn needed 
    for both user pool and client */
    signUp.role?.attachInlinePolicy(
      new iam.Policy(this, "userpool-policy", {
        statements: [
          new iam.PolicyStatement({
            actions: [
              "cognito-idp:AdminGetUser",
              "cognito-idp:AdminDeleteUser",
            ],
            resources: [
              userPool.userPoolArn,
              `arn:aws:cognito-idp:${userPool.stack.region}:${userPool.stack.account}:userpool/${userPoolClient.userPoolClientId}`,
            ],
          }),
        ],
      })
    );

    //api gateway constructor
    const signUpapi = new apigw.LambdaRestApi(this, "SignUpEndpoint", {
      handler: signUp,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });

    //sign-in
    const auth = signUpapi.root.addResource("auth");
    auth.addMethod("POST");
    const handlePw = auth.addResource("{email}");
    handlePw.addMethod("PATCH");
    handlePw.addMethod("HEAD");

    //new user and confirmation email
    const newAuth = signUpapi.root.addResource("sign-up");
    newAuth.addMethod("POST");
    newAuth.addMethod("PATCH");

    //resend confirmation
    const resendConf = newAuth.addResource("{email}");
    resendConf.addMethod("HEAD");
  }
}
