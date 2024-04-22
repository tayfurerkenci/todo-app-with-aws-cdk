import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class TodoBackend extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const todosTable = new dynamodb.Table(this, "Todos", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const listTodosFunction = new lambdaNodejs.NodejsFunction(this, "ListTodosFunction", {
        entry: "lambda/listTodos.ts",
        handler: "handler",
        environment: {
            TABLE_NAME: todosTable.tableName,
        },
    });

    todosTable.grantReadData(listTodosFunction);

    const createTodoFunction = new lambdaNodejs.NodejsFunction(this, "CreateTodoFunction", {
      entry: "lambda/createTodo.ts",
      handler: "handler",
      environment: {
          TABLE_NAME: todosTable.tableName,
      },
    });

    todosTable.grantReadWriteData(createTodoFunction);

    const deleteTodoFunction = new lambdaNodejs.NodejsFunction(this, "DeleteTodoFunction", {
      entry: "lambda/deleteTodo.ts",
      handler: "handler",
      environment: {
          TABLE_NAME: todosTable.tableName,
      },
    });

    todosTable.grantReadWriteData(deleteTodoFunction);

    const todoServiceApi = new apigateway.RestApi(this, "TodoRestAPI", {
      restApiName: "TODO Service API",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    const todos = todoServiceApi.root.addResource("todos");

    todos.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createTodoFunction)
    );

    todos.addMethod(
      "GET",
      new apigateway.LambdaIntegration(listTodosFunction)
    );

    todos.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteTodoFunction)
    );
  }
}