const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
app.use(cors())


const { S3Client, ListObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const upload = multer({ dest: 'pics/' });
const { readFileSync, unlinkSync } = require("fs");


const s3Client = new S3Client({
    credentials: {
      accessKeyId: 'your-civo-access-key',
      secretAccessKey: 'your-civo-secret-key',
    },
    endpoint: 'your-civo-objectstore-endpoint',
    region: 'your-region',
    forcePathStyle: true, // this allows the sdk follow the endpoint structure and not append the bucket name
  });

  const uploadFileToBucket = async ({ bucketName, file }) => {
    try {
      const getFileExt = file.originalname.split('.').pop();
  
      const filePath = file.path;
      const fileContent = readFileSync(filePath);
      const upload = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Body: fileContent,
          Key: file.filename + '.' + getFileExt,
          ACL: 'public-read',
        }),
      );
  
      unlinkSync(file.path);
      return upload;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  };

  app.put('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).send('File not uploaded');
        return;
      }

      const upload = await uploadFileToBucket({ bucketName: 'your-civo-object-store', file: req.file  });
      res.send(upload);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send('Error uploading file');
    }
  });

  app.get('/all', async (req, res) => {
    try {
      const command = new ListObjectsCommand({ Bucket: 'your-civo-object-store' });
      const { Contents } = await s3Client.send(command);
      res.send(Contents);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving objects');
    }
  });

  app.get('/', (req, res) => res.json({ message: 'Hello World!' }))

    app.listen(port, () => console.log(`This is the beginning of the Node File Upload App`))