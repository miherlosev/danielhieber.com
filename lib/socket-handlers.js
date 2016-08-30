/* eslint-disable no-console */
const codes = require('../public/data/codes.json');
const config = require('./config');
const documentdb = require('documentdb');
const fs = require('fs');
const path = require('path');
const models = require('../models/index');

// delcare models
const Category = models.Category;

// initialize Azure DocumentDB
const dbKey = process.env.DOCUMENTDB_KEY;
const dbUrl = process.env.DOCUMENTDB_URL;
const db = new documentdb.DocumentClient(dbUrl, { masterKey: dbKey });

const createError = (err, args) => {

  console.error(err, err.stack);

  let error;

  switch (err.code) {
    case codes.conflict:
      error = 'ID already exists.'; break;
    case codes.deleted:
      error = `Category with ID ${args[0]} successfully deleted.`; break;
    case codes.notFound:
      error = `No category with ID '${args[0]}' exists.`; break;
    case codes.tooLarge:
      error = 'The data is too large to store.'; break;
    default:
      error = 'Unknown server error.';
  }

  return {
    status: error.code || codes.serverError,
    error,
  };
};

const runCallback = (cb, ...args) => {
  if (typeof cb === 'function') return cb(...args);
};

const sendResponse = (err, res, cb) => {
  if (err) runCallback(cb, createError(err));
  else runCallback(cb, null, res);
};

// Runs when client connects
exports.connect = socket => {

  /**
   * Gets the list of images from the /gallery folder
   * @return {Promise} Resolves to the list of filenames.
   */
  const getImageList = () => new Promise((resolve, reject) => {

    const galleryPath = path.join(__dirname, '../public/img/gallery');

    fs.readdir(galleryPath, 'utf8', (err, filenames) => {
      if (err) reject(err);
      resolve(filenames);
    });
  });

  // send the list of files in the /gallery folder to the client

  /**
   * Send the list of files in the /gallery folder to the client via websocket
   * @param  {Array} images The array of filenames
   * @return {undefined} No return
   */
  const sendImageList = images => socket.emit('gallery', images);

  getImageList()
  .then(images => sendImageList(images))
  .catch(() => sendImageList([]));

};

/**
 * Generic error handler
 * @method handleError
 * @param  {Object} err    The error object
 * @return {undefined} No return
 */
exports.handleError = err => console.error(err, err.stack);

/**
 * Adds a category to the database
 * @method addCategory
 * @param  {Object} data    The category data, in raw JSON format
 * @param  {Function} cb    The callback function for returning data to the client
 */
exports.addCategory = (data, cb) => {

  let category;

  try {
    category = new Category(data);
  } catch (err) {
    runCallback(cb, {
      status: 400,
      error: err.message,
    });
  }

  if (category) {
    db.createDocument(config.collLink, category, (err, res) => sendResponse(err, res, cb));
  }

};

/**
 * Deletes a category from the database
 * @method deleteCategory
 * @param  {String} category       The ID of the category to delete
 * @param  {Function} cb           The callback function for returning data to the client
 */
exports.deleteCategory = (category, cb) => {

  const sprocLink = `${config.collLink}/sprocs/update`;
  const thirtyDays = 2592000;

  const doc = {
    id: category,
    ttl: thirtyDays,
  };

  db.executeStoredProcedure(sprocLink, [doc], err => {
    if (err) {
      runCallback(cb, createError(err));
    } else {
      runCallback(cb, {
        status: codes.deleted,
        details: `Category with ID ${category} successfully deleted.`,
      });
    }
  });

};

/**
 * Retrieves all the categories from the database
 * @method getCategories
 * @param  {Function} cb    Callback for returning data to the client
 */
exports.getCategories = cb => {

  const query = `
    SELECT * FROM d
    WHERE (
      d.type = "category" AND
      NOT IS_DEFINED(d.ttl)
    )`;

  db.queryDocuments(config.collLink, query).toArray((err, res) => sendResponse(err, res, cb));
};

/**
 * Updates a category
 * @method updateCategory
 * @param  {Object} data       The category object to update, in raw JSON format
 * @param  {Function} cb       The callback function for returning data to the client
 */
exports.updateCategory = (data, cb) => {

  let category;

  try {
    category = new Category(data);
  } catch (err) {
    runCallback(cb, {
      status: 400,
      error: err.message,
    });
  }

  if (category) {
    db.upsertDocument(config.collLink, category, (err, res) => sendResponse(err, res, cb));
  }

};