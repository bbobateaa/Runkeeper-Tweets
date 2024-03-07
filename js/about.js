

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	tweet_array = runkeeper_tweets.map(function(tweet) {
		const tweetsDate = new Date(tweet.created_at);

		const formatDate = tweetsDate.toLocaleDateString('en-us', {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric"

		});

		tweet.created_at = formatDate;
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	// Tweets date
	const earliestDate = tweet_array[0].time;
	const latestDate = tweet_array[tweet_array.length - 1].time;

	document.getElementById('numberTweets').innerText = tweet_array.length;
	document.getElementById('firstDate').innerText = latestDate;
	document.getElementById('lastDate').innerText = earliestDate;
	
	// Completed Events
	const completedEventsFilter = tweet_array.filter(tweet => tweet.source === "completed_event");
	const completedEventsCount = completedEventsFilter.length;
	const totalEventsCount = tweet_array.length;
  	const completedEventsPct = (completedEventsCount / totalEventsCount) * 100;

	document.querySelector('.completedEvents').innerText = completedEventsCount;
	document.querySelector('.completedEventsPct').innerText = (completedEventsPct.toFixed(2) + "%");

	// Live Events
	const liveEvents = tweet_array.filter(tweet => tweet.source === "live_event").length;
	const liveEventsPct = (liveEvents / totalEventsCount) * 100;

	document.querySelector('.liveEvents').innerText = liveEvents;
  	document.querySelector('.liveEventsPct').innerText = (liveEventsPct.toFixed(2) + "%");

	// Achievements
	const achievementCount = tweet_array.filter(tweet => tweet.source === "achievement").length;
	const achievementPct = (achievementCount / totalEventsCount) * 100;

	document.querySelector('.achievements').innerText = achievementCount;
	document.querySelector('.achievementsPct').innerText = (achievementPct.toFixed(2) + "%");

	// Miscellaneous
	const miscellaneousCount = tweet_array.filter(tweet => tweet.source === "miscellaneous").length;
	const miscellaneousPct = (miscellaneousCount / totalEventsCount) * 100;

	document.querySelector('.miscellaneous').innerText = miscellaneousCount;
	document.querySelector('.miscellaneousPct').innerText = (miscellaneousPct.toFixed(2) + "%");

	// Written text
	const writtenCount = tweet_array.filter(tweet => tweet.written === true).length;
	const writtenPct = (writtenCount / completedEventsCount) * 100;

	document.querySelector('._completedEvents').innerText = completedEventsCount;
	document.querySelector('.written').innerText = writtenCount;
	document.querySelector('.writtenPct').innerText = (writtenPct.toFixed(2) + "%");
}
//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});