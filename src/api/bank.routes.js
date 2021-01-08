const { Router } = require('express');

const router = Router();

router.route('/account')

router.route('/account/:id').get()

router.route('/transfer').post()

router.route('/deposit').post()

module.exports = router;
