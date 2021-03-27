// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CfnOutput, Construct, Stage, StageProps, Tags } from "@aws-cdk/core";
import { NetworkingStack } from "./networking-stack";

interface DeployStageProps extends StageProps {
  logicalEnv: string;
}

export class NetworkingDeployStage extends Stage {

  public readonly vpc: CfnOutput;

  constructor(scope: Construct, id: string, props?: DeployStageProps) {
    super(scope, id, props);
    
    const logicalEnv = props?.logicalEnv || 'dev';
    const stack = new NetworkingStack(this, 'NetworkingStack', {logicalEnv});

    Tags.of(stack).add('environment', logicalEnv);

    this.vpc = stack.vpc;
  }
}