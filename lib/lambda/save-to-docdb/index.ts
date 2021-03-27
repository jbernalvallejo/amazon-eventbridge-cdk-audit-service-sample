// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as AWS from 'aws-sdk';
import {MongoClient} from 'mongodb';

let cachedDb = false;
const secretName = process.env.AUDIT_DB_SECRET_NAME || 'audit-db-secret-name';

async function handler(event: any): Promise<string | void> {
  try {

    console.log('Raw event', event);

    const db = await connectToDatabase();
    // db.collection('events').insert({});
    

  } catch (e) {
    console.log('There has been an error while trying to save to Amazon DocumentDB', e);
    throw e;
  }
}

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // retrieve secret
  const secretsManager = new AWS.SecretsManager({apiVersion: '2017-10-17'});
  const response = await secretsManager.getSecretValue({SecretId: secretName}).promise();
  console.log('secrets manager response', response);

  const {SecretString: secret} = response;
  console.log('secret', secret)

  // connect to mongodb
  return;
}

export { handler };
