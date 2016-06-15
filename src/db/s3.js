import AWS from 'aws-sdk';

export function readS3 (region, accessKeyId, secretAccessKey, bucket, createBucket=false) {
  return async function (path) {
    try {
      if (createBucket) {
        await createS3Bucket(region, accessKeyId, secretAccessKey, bucket);
      }

      const s3bucket = new AWS.S3({
        region,
        accessKeyId,
        secretAccessKey,
        params: {
          Bucket: bucket,
        },
      });

      return new Promise((resolve, reject) => {
        s3bucket.getObject({
          Bucket: bucket,
          Key: path,
        }, (err, data) => {
          if (err && err.statusCode === 404) { return resolve (''); }
          if (err) { return reject(err); }
          return resolve(data.Body.toString());
        });
      });
    } catch (e) { console.log(e); }
  };
}

export function writeS3 (region, accessKeyId, secretAccessKey, bucket, createBucket=false) {
  return async function (path, data) {
    try {
      if (createBucket) {
        await createS3Bucket(region, accessKeyId, secretAccessKey, bucket);
      }

      const s3bucket = new AWS.S3({
        region,
        accessKeyId,
        secretAccessKey,
        params: {
          Bucket: bucket,
          Key: path,
        },
      });

      return new Promise((resolve, reject) => {
        s3bucket.upload({ Body: data }, (err, data) => {
          if (err) { return reject(err); }
          resolve(data);
        });
      });
    } catch(e) { console.log(e); }
  };
}

export async function createS3Bucket (region, accessKeyId, secretAccessKey, bucket) {
  try {
    const newBucket = new AWS.S3({
      region,
      accessKeyId,
      secretAccessKey,
      params: {
        Bucket: bucket,
      },
    });

    return new Promise(resolve => newBucket.createBucket(resolve));
  } catch(e) { console.log(e); }
}
