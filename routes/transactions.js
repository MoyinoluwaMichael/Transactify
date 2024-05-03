const express = require('express')

const router = express.Router()
const {
    getAllTransactions,
    getTransactionByUUID,
    getByExternalCreatedDate,
    getByStatus,
    getTotalAmountPaidForAMonth,
    getTotalAmountPaidForAMonthByPsp,
    getTotalAmountOfTransactionsByStatus,
    convertCurrency
} = require('../controllers/transactions');

router.route('/').get(getAllTransactions);
router.route('/:id').get(getTransactionByUUID);
router.route('/getByExternalCreatedDate/:date').get(getByExternalCreatedDate);
router.route('/getByStatus/:status').get(getByStatus);
router.route('/getTotalAmountPaidForAMonth/:date').get(getTotalAmountPaidForAMonth);
router.route('/getTotalAmountPaidForAMonthByPsp/:date').get(getTotalAmountPaidForAMonthByPsp);
router.route('/getTotalAmountOfTransactionsByStatus/:status').get(getTotalAmountOfTransactionsByStatus);
router.route("/convertCurrency").post(convertCurrency);

module.exports = router