const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3-transform')
const sharp = require('sharp')

const config = require('../config')

aws.config.update({
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  region: 'us-east-2',
})

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false)
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'bbaldoni',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    shouldTransform(req, file, cb) {
      cb(null, /^image/i.test(file.mimetype))
    },
    transforms: [{
      id: 'original',
      key(req, file, cb) {
        const fileExtension = file.mimetype.split('/')[1]

        cb(null, `${Date.now().toString()}.${fileExtension}`)
      },
      transform(req, file, cb) {
        cb(null, sharp().rotate().resize({
          width: 2048,
          height: 2048,
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        }))
      },
    }],
  }),
})

module.exports = upload
