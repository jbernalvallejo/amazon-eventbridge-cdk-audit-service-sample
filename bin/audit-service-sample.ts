#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { PipelineStack as ServicePipelineStack } from '../lib/pipeline-stack';

const app = new App();
new ServicePipelineStack(app, 'AuditServicePipeline', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

app.synth();