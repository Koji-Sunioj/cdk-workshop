import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { HitCounter } from "./hitcounter";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "Albums", {
      partitionKey: { name: "albumId", type: dynamodb.AttributeType.STRING },
    });

    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
      environment: {
        ALBUM_TABLE_NAME: table.tableName,
      },
    });
    table.grantReadWriteData(hello);
    // const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
    //   downstream: hello,
    // });

    const api = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
      // handler: helloWithCounter.handler,
      proxy: false,
    });
    const albums = api.root.addResource("albums");
    albums.addMethod("GET");
    albums.addMethod("POST");

    const album = albums.addResource("{albumId}");
    album.addMethod("GET");
    album.addMethod("DELETE");
    album.addMethod("PATCH");
  }
}
