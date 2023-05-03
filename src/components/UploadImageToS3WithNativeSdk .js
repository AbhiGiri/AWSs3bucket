import React, { useEffect, useState } from 'react'
import AWS from 'aws-sdk';

const S3_BUCKET = 'img3-bucket';
const REGION = 'us-east-1';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
});

const myBucket = new AWS.S3({
  params: S3_BUCKET,
  region: REGION
});

const UploadImageToS3WithNativeSdk = () => {
  const [progress , setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    const params = {
      Bucket: S3_BUCKET
    };

    myBucket.listObjectsV2(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        const imagesArray = data.Contents.map(content => {
          return {
            url: `https://${params.Bucket}.s3.${REGION}.amazonaws.com/${content.Key}`
          };
        });
        setImages(imagesArray);
      }
    });
  }, [images]);

  const uploadFile = (file) => {
    const params = {
      ACL: 'public-read',
      Body: file,
      Bucket: S3_BUCKET,
      Key: file.name
    };

    myBucket.putObject(params)
      .on('httpUploadProgress', (e) => {
        setProgress(Math.round((e.loaded/e.total) * 100));
      })
      .send((err) => {
        if(err) console.log(err);
      });

    setSelectedFile('');
  }

  return (
    <div>
      <div>Native SDK File Upload Progress is {progress}%</div>
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button onClick={() => uploadFile(selectedFile)}> Upload to S3</button>
      <br />
      <div >
        {images.map(image => (
          <img key={image.url} src={image.url} alt="S3 Object" className='styleImgs'/>
        ))}
    </div>
    </div>
  )
}

export default UploadImageToS3WithNativeSdk 