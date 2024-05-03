const sequelize = require("../db/sequelize");
const { Op } = require("sequelize");
const Transaction = require("../models/transaction")(sequelize);
const { StatusCodes } = require("http-status-codes");
const moment = require("moment");
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser"); // Import the parser class
const xmlParser = new XMLParser();
// const { BadRequestError, NotFoundError } = require('../errors')

const getAllTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { rows, count } = await Transaction.findAndCountAll({
      limit: limit,
      offset: offset,
    });

    res.status(200).json({
      total: count,
      page: page,
      limit: limit,
      transactions: rows,
    });
  } catch (error) {
    console.error("TRANSACTION ERROR::>> ", error);
    res.status(500).json({ error: error.message });
  }
};

const getTransactionByUUID = async (req, res) => {
  try {
    console.log("Request UUID::>> ", req.params.id);

    const transaction = await Transaction.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    res.status(200).json({ transaction });
  } catch (error) {
    console.log("TRANSACTION ERROR::>> ", error);
    res.status(500).json({ error: error.message });
  }
};

const getByExternalCreatedDate = async (req, res) => {
  try {
    const date = moment.tz(req.params.date, "YYYY-MM-DD", true, "UTC");

    if (!date.isValid()) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const startOfDay = date.startOf("day").toISOString();
    const endOfDay = date.endOf("day").toISOString();

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { rows, count } = await Transaction.findAndCountAll({
      where: {
        external_created_at: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      limit: limit,
      offset: offset,
    });

    res.status(200).json({
      total: count,
      page: page,
      limit: limit,
      transactions: rows,
    });
  } catch (error) {
    console.error("TRANSACTION ERROR::>> ", error);
    res.status(500).json({ error: error.message });
  }
};

const getByStatus = async (req, res) => {
  try {
    console.log("REQ::>> ", req);
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const { rows, count } = await Transaction.findAndCountAll({
      where: {
        status_original: {
          [Op.iLike]: req.params.status,
        },
      },
      limit: limit,
      offset: offset,
    });
    res.status(200).json({
      total: count,
      page: page,
      limit: limit,
      transactions: rows,
    });
  } catch (error) {
    console.log("TRANSACTION ERROR::>> ", error);
    res.status(500).json({ error: error.message });
  }
};

const getTotalAmountPaidForAMonth = async (req, res) => {
  try {
    const date = moment.tz(req.params.date, "YYYY-MM-DD", true, "UTC");
    const startOfMonth = date.startOf("month").toISOString();
    const endOfMonth = date.endOf("month").toISOString();

    const totalAmountPaid = await Transaction.sum("amount", {
      where: {
        external_created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const count = await Transaction.count({
      where: {
        external_created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    return res.status(200).json({
      dateFrom: startOfMonth,
      dateTo: endOfMonth,
      totalAmountPaid: totalAmountPaid,
      noOfTransactions: count,
    });
  } catch (error) {
    console.log("TRANSACTION ERROR::>> ", error);
    res.status(500).json({ error: error.message });
  }
};

const getTotalAmountPaidForAMonthByPsp = async (req, res) => {
  try {
    console.log("getTotalAmountPaidForAMonthByPsp");
    const date = moment.tz(req.params.date, "YYYY-MM-DD", true, "UTC");
    if (!date.isValid()) {
      throw new Error("Invalid date format");
    }
    const psp = req.query.psp;
    const startOfMonth = date.startOf("month").toISOString();
    const endOfMonth = date.endOf("month").toISOString();
    const totalAmountPaid = await Transaction.sum("amount", {
      where: {
        external_created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
        "payload.psp": {
          [Op.iLike]: psp,
        },
      },
    });

    const count = await Transaction.count({
      where: {
        external_created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
        "payload.psp": {
          [Op.iLike]: psp,
        },
      },
    });

    return res.status(200).json({
      dateFrom: startOfMonth,
      dateTo: endOfMonth,
      totalAmountPaid: totalAmountPaid,
      noOfTransactions: count,
    });
  } catch (error) {
    console.log("TRANSACTION ERROR::>> ", error);
    res.status(500).json({ error: error.message });
  }
};

const getTotalAmountOfTransactionsByStatus = async (req, res) => {
  console.log("getTotalAmountFailedTransactions");
  try {
    const status = req.params.status;
    const totalAmountPaid = await Transaction.sum("amount", {
      where: {
        status_original: {
          [Op.iLike]: status,
        },
      },
    });

    const count = await Transaction.count({
      where: {
        status_original: {
          [Op.iLike]: status,
        },
      },
    });

    return res.status(200).json({
      transactionStatus: status,
      totalAmountPaid: totalAmountPaid,
      noOfTransactions: count,
    });
  } catch (error) {
    console.log("TRANSACTION ERROR::>> ", error);
    res.status(500).json({ error: error.message });
  }
};

const convertCurrency = async (req, res) => {
  try {
    const currentDate = moment();
    const currentDateString = currentDate.format("YYYY-MM-DD");
    const currency = req.body.targetCurrency;
    const amount = req.body.amount;
    console.log("PAYLOAD::>> ", req.body);
    const url =
      "https://lb.lt/webservices/FxRates/FxRates.asmx/getFxRatesForCurrency?tp=LT&ccy=" +
      currency +
      "&dtFrom=" +
      currentDateString +
      "&dtTo=" +
      currentDateString;
      
    console.log("URL::>> ", url);
    const response = await axios.get(url);
    console.log("Response::>> ", response.data);

    const jsonObj = xmlParser.parse(response.data);
    console.log("JSON Result:", jsonObj);

    const jsonResult = JSON.stringify(jsonObj, null, 2);
    console.log("Error Desc::>> ", jsonObj.FxRates?.OprlErr?.Desc);
    if (jsonObj?.FxRates?.OprlErr != null) {
      throw new Error(jsonObj?.FxRates?.OprlErr?.Desc);
    }
    const fxRate = jsonObj.FxRates.FxRate.CcyAmt;
    const rate = fxRate[1].Amt;
    console.log("FXRATE::", fxRate);
    console.log("RATE::", rate);
    const conversionAmount = rate*amount;
    res.status(200).json({
      amount: amount,
      targetCurrency: currency,
      conversionAmount: conversionAmount,
      rate: jsonObj.FxRates.FxRate
    });
  } catch (error) {
    console.log("TRANSACTION ERROR::>> ", error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionByUUID,
  getByExternalCreatedDate,
  getByStatus,
  getTotalAmountPaidForAMonth,
  getTotalAmountPaidForAMonthByPsp,
  getTotalAmountOfTransactionsByStatus,
  convertCurrency,
};
