// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core"
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { CdkPipeline, ShellScriptAction, SimpleSynthAction } from "@aws-cdk/pipelines";
import * as ssm from '@aws-cdk/aws-ssm';
import { AuditServiceDeployStage } from "./audit-service-sample-stage";
import { NetworkingDeployStage } from "./networking-stage";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifacts = new codepipeline.Artifact();
    const cloudAssemblyArtifacts = new codepipeline.Artifact();

    const pipeline = new CdkPipeline(this, 'AuditServicePipeline', {
      crossAccountKeys: false, // https://docs.aws.amazon.com/cdk/api/latest/docs/pipelines-readme.html#a-note-on-cost
      pipelineName: 'AuditService',
      cloudAssemblyArtifact: cloudAssemblyArtifacts,

      // source
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'Source',
        output: sourceArtifacts,
        owner: ssm.StringParameter.fromStringParameterName(this, 'GithubUsername', 'github_username').stringValue,
        repo: 'amazon-eventbridge-cdk-audit-service-sample',
        oauthToken: SecretValue.secretsManager('github_token', { jsonField: 'github_token' }),
        branch: 'aws-summit-2021'
      }),

      // build
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact: sourceArtifacts,
        cloudAssemblyArtifact: cloudAssemblyArtifacts,
        buildCommand: 'npm run build',
        synthCommand: 'npm run synth'
      })
    });

    // deploy to staging
    const stagingEnvName = 'staging';

    // networking
    const networkingStagingDeploy = new NetworkingDeployStage(this, 'NetworkingStaging', {
      logicalEnv: stagingEnvName
    });
    pipeline.addApplicationStage(networkingStagingDeploy);

    // database

    // service
    const serviceStagingDeploy = new AuditServiceDeployStage(this, 'AuditServiceStaging', {
      logicalEnv: stagingEnvName
    });
    const stagingStage = pipeline.addApplicationStage(serviceStagingDeploy);

    // e2e-tests
    const e2eTestAction = new ShellScriptAction({
      actionName: 'Test',
      useOutputs: {
        AUDIT_EVENT_BUS_NAME: pipeline.stackOutput(serviceStagingDeploy.busName),
        AUDIT_BUCKET_NAME: pipeline.stackOutput(serviceStagingDeploy.bucketName),
        AUDIT_TABLE_NAME: pipeline.stackOutput(serviceStagingDeploy.tableName),
        AUDIT_LOG_GROUP_NAME: pipeline.stackOutput(serviceStagingDeploy.logGroupName),
        AUDIT_TOPIC_NAME: pipeline.stackOutput(serviceStagingDeploy.topicName)
      },
      additionalArtifacts: [sourceArtifacts],
      commands: [
        'cd test',
        'npm ci',
        'npm test'
      ]
    });

    stagingStage.addActions(e2eTestAction);
    e2eTestAction.project.role?.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess'});
    e2eTestAction.project.role?.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess'});
    e2eTestAction.project.role?.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'});
    e2eTestAction.project.role?.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/CloudWatchLogsReadOnlyAccess'});

    // deploy to production
    const productionEnvName = 'production';

    // networking
    // database
    // service
    pipeline.addApplicationStage(new AuditServiceDeployStage(this, 'AuditServiceProduction', {
      logicalEnv: productionEnvName
    }), {
      manualApprovals: true
    });
  }
}