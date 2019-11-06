const router = require('express').Router()
const sharp = require('sharp')
const request = require('request')

router.get('/resize', (req, res) => {
  const transformer = sharp()
    .resize({
      width: 1024,
      height: 1024,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })

  res.set('Content-Type', 'image/jpg')
  request(req.query.path).pipe(transformer).pipe(res)
})

module.exports = router
