import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
//import { HitCounter } from "./hitcounter";

//s3 and cloud front deployment imports
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import {
  Distribution,
  OriginAccessIdentity,
  ErrorResponse,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CacheControl } from "aws-cdk-lib/aws-s3-deployment";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
  }
}
