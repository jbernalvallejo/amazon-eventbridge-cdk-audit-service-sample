// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Vpc } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, Tag, Tags } from '@aws-cdk/core';

interface NeworkingStackProps extends cdk.StackProps {
  logicalEnv: string;
}

export class NetworkingStack extends cdk.Stack {

  public readonly vpc: CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: NeworkingStackProps) {
    super(scope, id, props);

    const prefix = props?.logicalEnv;
    const vpc = new Vpc(this, 'Vpc');
    Tags.of(vpc).add('Name', `${prefix}-vpc`);

    // outputs
    this.vpc = new CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC identifier'
    });
  }
}
