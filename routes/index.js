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


//database
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://assignment2results:puAMEkf7nTfur9tnFg4Iio3JGy1mfqSpOuqpPGuHQboRjT7b7cSPrfFyMFz9mA0z5PGjdtr6ixDK5TcUezNvYg%3D%3D@assignment2results.documents.azure.com:10255/?ssl=true';


/* GET home page. */
router.get('/', function(req, res, next) {
	res.send("test");
  //res.render('index', { title: 'Express' });
});
let totalResults = [];
let totalReaction = [{label: "negative", value : 1}, {label: "positive", value : 1}, {label: "neutral", value : 1}];
let test = [{a:1}, {b:2}];
var inserDocument = function(db, callback) {
	var collection
	db.collection().insert;
}

function findResults() {
	return new Promise(resolve => {
		MongoClient.connect(url, function(err, client) {
		if (err) {
			console.log(err);
		} else {
			var db = client.db('data');
			var collection = db.collection('analyzer');
			collection.find().sort({_id:-1}).limit(3).toArray(function(err, docs) {
			//db.getIndexSiz(function(err, docs) {
				//client.close();
				if (err) {
					console.log(err);
				} else {
					console.log(docs);
					resolve(docs);
				}
				client.close();
			})			
		}
	})
	})
	
}

function insertResults(results) {
	MongoClient.connect(url, function(err, client) {
		if (err) {
			console.log(err);
		}
		var db = client.db('data');
		var collection = db.collection('analyzer');
		results = [{label: "negative", value : results[0].value, color : "#ff4500"},
				 {label: "positive", value : results[1].value, color : "#1DA1F2"},
				 {label: "neutral", value : results[2].value, color : "#2f2f2f"}];
		collection.insertMany(results, function(err, results) {
			//client.close();
			if (err) {
				console.log(err);
			} else {
				//console.log("Saved!");
			}
			client.close();
		})
	})
}
router.post('/', function(req, res, next) {
	try {
	let textArray = JSON.parse(req.body.text);
	let results = [];
	for (let i = 0; i < textArray.length; i++) {
		let text = textArray[i];
		let result = sentiment.analyze(text);
		let arrayText = tokenizer.tokenize(text);
		let score = analyzer.getSentiment(arrayText);
		let score2 = analyzer2.getSentiment(arrayText);
		let langauge = lngDetector.detect(text, 2);

		if (score < 0) {
			totalReaction[0].value += 3;
		} else if (score > 0) {
			totalReaction[1].value += 3;
		} else {
			totalReaction[2].value += 1;
		}

		insertResults(totalReaction);	
	}
	} catch(e) {
		console.log(e);
	}

	//res.send({ result: score});
})

router.get('/results', async function(req, res, next) {
	//sendResults2 = JSON.stringify(sendResults2);
	//sendResults2 = JSON.parse(sendResults2);
	console.log("Server");
	console.log(totalReaction);
	console.log(totalResults.length);
	let sendResults = JSON.stringify(totalReaction);
	//insertResults(totalReaction);
	let sendResults2 = await findResults();
	console.log("database");
	console.log(sendResults2);
	res.send(sendResults2);
})

module.exports = router;
