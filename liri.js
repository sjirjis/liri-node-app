var keysFile = require('./keys.js');
var Twitter = require('twitter');
var https = require('https');
var http = require('http');
var moment = require('moment');
var spotify = require('spotify');
var request = require('request');
var fs = require('fs');

var twitterKeys = keysFile.twitterKeys;

var client = new Twitter({
    consumer_key: twitterKeys.consumer_key,
    consumer_secret: twitterKeys.consumer_secret,
    access_token_key: twitterKeys.access_token_key,
    access_token_secret: twitterKeys.access_token_secret
});

var tweetCount = 0;
var spotifyQuery = null;
var movieTitle = null;
var randomSong = null;
var tweetArray = [];

function CaptureTweet(tweetCount, tweetText, tweetCreateDt) {
    this.tweetCount = tweetCount;
    this.tweetText = tweetText;
    this.tweetCreateDt = tweetCreateDt;
};

var searchTweets = function() {
    if (tweetCount < 20) {
        client.get('search/tweets', { q: 'JirjisSteven', count: 20 }, function(error, tweets, response) {
            if (error) {
                console.log('Error occurred: ' + error);
                return;
            } else {
                var tweetData = new CaptureTweet();

                tweetData.tweetCount = 'Tweet # ' + (tweetCount + 1),
                    tweetData.tweetText = tweets.statuses[tweetCount].text,
                    tweetData.tweetCreateDt = tweets.statuses[tweetCount].created_at

                tweetArray.push(tweetData);

                tweetCount++;

                searchTweets();
            }
        });
    } else {
        var tweetDataObj = { tweetArray };

        console.log(tweetDataObj);
        console.log('Done with Tweets!');

        fs.appendFile('log.txt', JSON.stringify(tweetDataObj, null, 2), function(err) {
            if (err) {
                console.log(err);
            } else {
                fs.appendFileSync('log.txt', '\n')
                console.log('Content added to log.txt');
            }
        });
    }
};


var spotifySearch = function(spotifyQuery) {

    if (spotifyQuery === null || spotifyQuery === undefined) {
        spotifyQuery = 'The Sign';
    }

    spotify.search({ type: 'track', query: spotifyQuery + '&limit=1' }, function(error, data) {
        if (error) {
            console.log('Error occurred: ' + error);
            return;
        } else {
            var spotifyData = {
                Artists_Name: data.tracks.items[0].album.artists[0].name,
                Songs_Name: data.tracks.items[0].name,
                Preview_URL: data.tracks.items[0].preview_url,
                Album_Name: data.tracks.items[0].album.name
            };

            console.log(spotifyData);

            fs.appendFile('log.txt', JSON.stringify(spotifyData, null, 2), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    fs.appendFileSync('log.txt', '\n')
                    console.log('Content added to log.txt');
                }
            });
        }
    });
};

var movieSearch = function(movieTitle) {
    if (movieTitle === null || movieTitle === undefined) {
        movieTitle = 'Mr. Nobody';
    }

    movieTitle = encodeURI(movieTitle);
    request('http://www.omdbapi.com/?apikey=825db247&t=' + movieTitle, function(error, response, body) {
        var movieData = {
            Title: JSON.parse(body).Title,
            Year: JSON.parse(body).Year,
            IMDB_Rating: JSON.parse(body).imdbRating,
            Country: JSON.parse(body).Country,
            Language: JSON.parse(body).Language,
            Plot: JSON.parse(body).Plot,
            Actors: JSON.parse(body).Actors,
            Rotten_Tomatoes_Rating: JSON.parse(body).Ratings[1].Value,
            Rotten_Tomatoes_URL: "https://www.rottentomatoes.com/m/" + movieTitle
        };

        console.log(movieData);

        fs.appendFile('log.txt', JSON.stringify(movieData, null, 2), function(err) {
            if (err) {
                console.log(err);
            } else {
                fs.appendFileSync('log.txt', '\n')
                console.log('Content added to log.txt');
            }
        });
    });
};

if (process.argv[2] === 'my-tweets') { searchTweets(); }

if (process.argv[2] === 'spotify-this-song') {
    spotifyQuery = process.argv[3];
    spotifySearch(spotifyQuery);
}

if (process.argv[2] === 'movie-this') {
    movieTitle = process.argv[3];
    movieSearch(movieTitle);
}

if (process.argv[2] === 'do-what-it-says') {
    spotifyQuery = fs.readFileSync('./random.txt', 'utf8').substring(20, 40);
    spotifySearch(spotifyQuery);
}
