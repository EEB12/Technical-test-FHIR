var express = require('express');
var router = express.Router();
const {
 countDiagnosis
} = require('../controllers/diagnosis.controller')
/* GET home page. */
router.get('/', countDiagnosis);

module.exports = router;
