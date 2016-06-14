import AWS from 'aws-sdk';

export function readS3 (region, key, secret, bucket, filename, createBucket=false) {
  return async function (path) {
    // yayyyy globals, thanks amazon
    AWS.config.region = region;

    if (createBucket) {
      await createS3Bucket(region, key, secret, bucket);
    }

    const bucket = new AWS.S3({ params: { Bucket: bucket, Key: key } });
    bucket.
  };
}

export function writeS3 (region, key, secret, bucket, filename, createBucket=false) {
  return async function (path, data) {
    AWS.config.region = region;

    if (createBucket) {
      await createS3Bucket(region, key, secret, bucket);
    }

    const bucket = new AWS.S3({ params: { Bucket: bucket, Key: key } });
    return new Promise((resolve, reject) => {
      bucket.upload({ Body: data }, (err, data) => {
        if (err) { return reject(err); }
        resolve(data);
      });
    });
  };
}

export async function createS3Bucket (region, key, secret, bucket) {
  AWS.config.region = region;

  const newBucket = new AWS.S3({ params: { Bucket: bucket, Key: key } });
  return new Promise(resolve => newBucket.createBucket(resolve));
}
