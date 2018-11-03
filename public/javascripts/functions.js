var express = require('express');
var router = express.Router();
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();


//database
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://assignment2results:puAMEkf7nTfur9tnFg4Iio3JGy1mfqSpOuqpPGuHQboRjT7b7cSPrfFyMFz9mA0z5PGjdtr6ixDK5TcUezNvYg%3D%3D@assignment2results.documents.azure.com:10255/?ssl=true';

const findResults = function(UID) {
	console.log("UID " + UID);
	return new Promise(resolve => {
		MongoClient.connect(url, function(err, client) {
		if (err) {
			console.log("error findResults " + err);
		} else {
			var db = client.db('data');
			var collection = db.collection('analyzer');
			collection.find({'UID' : UID}).toArray(function(err, docs) {
				if (err) {
					console.log("error findResults " + err);
				} else {
					//console.log(docs.length);
					resolve(docs);
				}
				client.close();
			})			
		}
	})
	})
	
}

const insertResults = function(results, UID) {
	MongoClient.connect(url, function(err, client) {
		if (err) {
			console.log("error insertResults " + err);
		}
		var db = client.db('data');
		var collection = db.collection('analyzer');
		results = [{label: "negative", value : results[0].value, color : "#ff4500", UID : UID},
				 {label: "positive", value : results[1].value, color : "#1DA1F2", UID : UID},
				 {label: "neutral", value : results[2].value, color : "#2f2f2f", UID : UID}];
				 //console.log(results);
		collection.insertMany(results, function(err, results) {
			if (err) {
				console.log("error insertResults " + err);
			} else {
			}
			client.close();
		})
	})
}

const computeReactionsDatabase = function(data) {
	//console.log(data);
	let results = [{label: "negative", value : 1, color : "#ff4500"},
				 {label: "positive", value : 1, color : "#1DA1F2"},
				 {label: "neutral", value : 1, color : "#2f2f2f"}];
	if (data.length < 1) return results;
	for (let i = 0; i < data.length; i++) {
		if (data[i].label == "negative") {
			results[0].value += data[i].value;
		} else if (data[i].label == "positive") {
			results[1].value += data[i].value;
		} else {
			results[2].value += data[i].value;
		}
	}
	return results;
}

const computeReactionsInternal = function(textArray, UID) {
	let reactions = [{label: "negative", value : 0}, {label: "positive", value : 0}, {label: "neutral", value : 0}];
	for (let i = 0; i < textArray.length; i++) {
		let text = textArray[i];
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

module.exports = {
	findResults,
	insertResults,
	computeReactionsDatabase,
	computeReactionsInternal 
}