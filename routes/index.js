var express = require('express');
var router = express.Router();
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
var analyzer2 = new Analyzer("English", stemmer, "afinn");
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.send("test");
  //res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
	let text = req.body.text;
	console.log(req.body);
	let result = sentiment.analyze(text);
	let arrayText = tokenizer.tokenize(text);
	let score = analyzer.getSentiment(arrayText);
	let score2 = analyzer2.getSentiment(arrayText);
	let langauge = lngDetector.detect(text, 2);
	console.log(langauge);

	console.log("afinn: " + score + ". senticon: " + score2);

	res.send(score);
})
module.exports = router;
