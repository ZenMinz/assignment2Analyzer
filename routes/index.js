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
	} catch(e) {
		res.sendCode(500);
	}
})

router.post('/results', async function(req, res, next) {
	try {
		let UID = req.body.UID;
		let sendResults = await functions.findResults(UID);
		sendResults = functions.computeReactionsDatabase(sendResults);
		sendResults = JSON.stringify(sendResults);
		res.send(sendResults);
	} catch (e) {
		res.sendCode(500);
	}

})

module.exports = router;
