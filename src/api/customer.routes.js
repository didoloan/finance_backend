const { Router } = require('express');

const router = Router();

router.post('/register').post()

router.post('/login').post()

router.post('/refresh').post()

router.post('/forgot').post()

module.exports = router;
