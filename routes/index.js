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
let totalResults = [];
router.post('/', function(req, res, next) {
	let textArray = JSON.parse(req.body.text);
	//let results = [];
	for (let i = 0; i < textArray.length; i++) {
		let text = textArray[i];
		let result = sentiment.analyze(text);
		let arrayText = tokenizer.tokenize(text);
		let score = analyzer.getSentiment(arrayText);
		let score2 = analyzer2.getSentiment(arrayText);
		let langauge = lngDetector.detect(text, 2);
		if (score != 0) {
			totalResults.push(score);
			console.log(score);
		}

		
	}
	console.log(score);
	//res.send({ result: score});
})

router.get('/results', function(req, res, next) {
	console.log(totalResults.length);
	let sendResults = JSON.stringify(totalResults);
	res.send(sendResults);
})

module.exports = router;
