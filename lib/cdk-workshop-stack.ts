import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaProps from "aws-cdk-lib/aws-lambda";

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

    //storage bucket
    const s3Bucket = new s3.Bucket(this, "albumBucket", {
      publicReadAccess: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    s3Bucket.grantRead(new iam.AccountRootPrincipal());

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
      sources: [Source.asset(path.resolve(__dirname, "../photo-albums/build"))],
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
    const albumLambda = new lambda.NodejsFunction(this, "AlbumHandler", {
      runtime: lambdaProps.Runtime.NODEJS_14_X,
      entry: "lambda/albums.ts",
      handler: "handler",
      environment: {
        ALBUM_TABLE_NAME: table.tableName,
        ALBUM_BUCKET_NAME: s3Bucket.bucketName,
        USER_POOL_CLIENT: userPoolClient.userPoolClientId,
        USER_POOL_ID: userPool.userPoolId,
      },
    });

    s3Bucket.grantPut(albumLambda);
    s3Bucket.grantReadWrite(albumLambda);

    //permission for lambda to invoke table ops
    table.grantReadWriteData(albumLambda);

    //api gateway constructor
    const api = new apigw.LambdaRestApi(this, "AlbumEndpoint", {
      handler: albumLambda,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });

    //creating paths and methods for api
    const albums = api.root.addResource("albums");
    albums.addMethod("GET");
    albums.addMethod("POST");

    const init = albums.addResource("init");
    init.addMethod("GET");

    const tags = albums.addResource("tags");
    tags.addMethod("GET");

    const album = albums.addResource("{albumId}");
    album.addMethod("GET");
    album.addMethod("DELETE");
    album.addMethod("PATCH");

    const s3Delete = album.addResource("{s3Object}");
    s3Delete.addMethod("DELETE");

    // user pool client needed for user signups, pool id for admin actions
    const signUp = new lambda.NodejsFunction(this, "SignUpHandler", {
      runtime: lambdaProps.Runtime.NODEJS_14_X,
      entry: "lambda/signup.ts",
      handler: "handler",
      environment: {
        USER_POOL_CLIENT: userPoolClient.userPoolClientId,
        USER_POOL_ID: userPool.userPoolId,
      },
    });

    process.env.DEFAULT;
    /* this is needed for admin actions in aws-sdk in cognito pool. arn needed 
    for both user pool and client */
    signUp.role?.attachInlinePolicy(
      new iam.Policy(this, "userpool-policy", {
        statements: [
          new iam.PolicyStatement({
            actions: [
              "cognito-idp:AdminGetUser",
              "cognito-idp:AdminDeleteUser",
              "cognito-idp:AdminSetUserPassword",
              "secretsmanager:GetSecretValue",
            ],
            resources: [
              "arn:aws:secretsmanager:eu-north-1:531997442459:secret:dev_users-CDP8oE",
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
    handlePw.addMethod("GET");

    //new user and confirmation email
    const newAuth = signUpapi.root.addResource("sign-up");

    newAuth.addMethod("POST");
    newAuth.addMethod("PATCH");

    //resend confirmation
    const resendConf = newAuth.addResource("{email}");
    resendConf.addMethod("HEAD");
  }
}
