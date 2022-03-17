const router = require('express').Router()
const advertisementController = require('../controllers/advertisementController')

router.get('ad_info/:id?', advertisementController.getAdvertisementInfo)
router.get('all_ads', advertisementController.getAllAdvertisements)
router.post('ad', advertisementController.postAdvertisement)
router.delete('ad/:id?', advertisementController.deleteAdvertisement)
router.put('ad/:id?',advertisementController.updateAdvertisement)

module.exports = router