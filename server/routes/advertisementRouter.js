const router = require('express').Router()
const advertisementController = require('../controller/advertisementController')
const authorization = require('../middleware/authorization')

router.get('/ad_info/:id?', advertisementController.getAdInfo)
router.get('/all_ads', advertisementController.getAllAds)
router.post('/post_ad', authorization, advertisementController.postAd)
router.post('/upload_image', authorization, advertisementController.imageUpload)
router.delete('/delete_ad/:id?', authorization, advertisementController.deleteAd)
router.put('/update_ad/:id?', authorization, advertisementController.updateAd)

module.exports = router