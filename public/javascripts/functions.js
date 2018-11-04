var express = require('express');
var router = express.Router();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
var collectionName = 'analyzer2';

//database
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://assignment2results:puAMEkf7nTfur9tnFg4Iio3JGy1mfqSpOuqpPGuHQboRjT7b7cSPrfFyMFz9mA0z5PGjdtr6ixDK5TcUezNvYg%3D%3D@assignment2results.documents.azure.com:10255/?ssl=true';

const findResults = function(UID, res) {
		MongoClient.connect(url, function(err, client) {
		if (err) {
			console.log("error findResults " + err);
		} else {
			var db = client.db('data');
			var collection = db.collection(collectionName);
			collection.find().sort({_id:-1}).limit(5000).toArray(function(err, docs) {
				client.close();
				if (err) {
					console.log(err);
					res.sendStatus(500);
				} else {
					let sendResults = computeReactionsDatabase(docs, UID);
					sendResults = JSON.stringify(sendResults);
					console.log(sendResults);
					res.send(sendResults);
				}

			})			
		}
	})
	
}

const insertResults = function(results, UID) {
	MongoClient.connect(url, function(err, client) {
		if (err) {
			console.log("error insertResults " + err);
		}
		var db = client.db('data');
		var collection = db.collection(collectionName);
		results = {negative : results[0].value, positive : results[1].value, neutral : results[2].value, UID : UID};
		collection.insertOne(results, function(err, results) {
			if (err) {
				console.log(err);
			} else {
			}
			client.close();
		})
	})
}

const computeReactionsDatabase = function(data, UID) {
	//console.log(data);
	let results = [{label: "negative", value : 1, color : "#ff4500"},
				 {label: "positive", value : 1, color : "#1DA1F2"},
				 {label: "neutral", value : 1, color : "#2f2f2f"}];
	if (data.length < 1) return results;
	console.log(data.length);
	for (let i = 0; i < 5; i++) {
		if (data[i].UID == UID) {
			results[0].value += data[i].negative;
			results[1].value += data[i].positive;
			results[2].value += data[i].neutral;
	}}
	return results;
}

const computeReactionsInternal = function(textArray, UID) {
	let reactions = [{label: "negative", value : 0}, {label: "positive", value : 0}, {label: "neutral", value : 0}];
	for (let i = 0; i < textArray.length; i++) {
		for (let j = 0; j < textArray.length; j++) {
			let text = textArray[i];
			//console.log(text);
			if (text) {
				let arrayText = tokenizer.tokenize(text);
				let score = analyzer.getSentiment(arrayText);
				if (score < 0) {
					reactions[0].value += 3;
				} else if (score > 0) {
					reactions[1].value += 3;
				} else {
					reactions[2].value += 1;
				}
				insertResults(reactions, UID);	
			}
		}
	}
	console.log("done");
}

module.exports = {
	findResults,
	insertResults,
	computeReactionsDatabase,
	computeReactionsInternal 
}