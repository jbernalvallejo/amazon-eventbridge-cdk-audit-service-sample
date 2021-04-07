// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DatabaseCluster } from '@aws-cdk/aws-docdb';
import { InstanceClass, InstanceSize, InstanceType, Vpc } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, Tags } from '@aws-cdk/core';

interface CommonStackProps extends cdk.StackProps {
  logicalEnv: string;
}

export class CommonStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: CommonStackProps) {
    super(scope, id, props);

    // vpc
    const prefix = props?.logicalEnv;
    const vpc = new Vpc(this, 'Vpc');
    Tags.of(vpc).add('Name', `${prefix}-vpc`);

    // documentdb cluster
    const cluster = new DatabaseCluster(this, 'Database', {
      dbClusterName: `${prefix}-audit-events-db`,
      masterUser: {
        username: 'docdb'
      },
      instanceProps: {
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
        vpc 
      }
    });

    cluster.addRotationSingleUser();

    // outputs
    new CfnOutput(this, 'SecretName', {
      exportName: `${prefix}-audit-db-secret-name`,
      value: cluster.secret!.secretName,
      description: 'Secret name for Audit Events database'
    });
  }
}
