#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TodoAppWithAwsCdkStack } from '../lib/todo-app-with-aws-cdk-stack';

const app = new cdk.App();
new TodoAppWithAwsCdkStack(app, 'TodoAppWithAwsCdkStack');
