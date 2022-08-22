const { SECRET_KEY, ACCESS_KEY, BUCKET_NAME } = require("./../utils/constants");
const AWS = require("aws-sdk");
const fs = require("fs");
module.exports = {
  Generalupload: async (req, res, next) => {
    const fileStream = fs.createReadStream(req.file.path);
    const s3 = new AWS.S3({
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    });
    // Setting up S3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: req.file.filename, // File name you want to save as in S3
      Body: fileStream,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentDisposition: "inline",
      ContentType: "application/zip",
    };
    if (req.file) {
      s3.upload(params, function (err, data) {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
      });
    }
    console.log(req.file);
    let filename = req.file.filename;
    console.log(req.file.path);
    if (filename) return res.status(200).json({ path: filename });
    return res.status(400).json({ error: "error upload" });
  },
  downloadFile: (fileKey) => {
    const s3 = new AWS.S3({
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    });
    const downloadParams = {
      Key: fileKey,
      Bucket: BUCKET_NAME,
    };
    return s3.getObject(downloadParams).createReadStream();
  },
};

// Uploading files to the bucket
