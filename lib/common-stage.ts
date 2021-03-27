// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Vpc } from "@aws-cdk/aws-ec2";
import { CfnOutput, Construct, Stage, StageProps, Tags } from "@aws-cdk/core";
import { CommonStack } from "./common-stack";

interface DeployStageProps extends StageProps {
  logicalEnv: string;
}

export class CommonDeployStage extends Stage {
  
  constructor(scope: Construct, id: string, props?: DeployStageProps) {
    super(scope, id, props);
    
    const logicalEnv = props?.logicalEnv || 'dev';
    const stack = new CommonStack(this, 'NetworkingStack', {logicalEnv});

    Tags.of(stack).add('environment', logicalEnv);
  }
}