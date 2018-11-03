var express = require('express');
var router = express.Router();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var functions = require('../public/javascripts/functions.js')

router.post('/input', function(req, res, next) {
	try {
		let textArray = JSON.parse(req.body.text);
		let UID = req.body.UID;
		functions.computeReactionsInternal(textArray, UID);
		res.sendStatus(200);
	} catch(e) {
		console.log(e);
		res.sendStatus(500);
	}
})

router.post('/results', function(req, res, next) {
	try {
		let UID = req.body.UID;
		functions.findResults(UID, res);
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
})


module.exports = router;
