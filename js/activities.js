function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	const activityCount = {};
	tweet_array.forEach(tweet => {
		// Counts activity types
		const activityType = tweet.activityType;
		if (activityType !== 'unknown') {
			activityCount[activityType] = (activityCount[activityType] || 0) + 1;
		}
	});
	
	const activityCountSize = Object.keys(activityCount).length;

	const sortedActivities = Object.entries(activityCount)
	    .sort((a, b) => b[1] - a[1])
	    .map(([activity]) => activity);

	// Get the top 3 activities
	const top3Activities = sortedActivities.slice(0, 3);

	// Displays top three activities in their appropriate spans.
	document.getElementById('numberActivities').innerText = activityCountSize;
	document.getElementById('firstMost').innerText = top3Activities[0];
	document.getElementById('secondMost').innerText = top3Activities[1];
	document.getElementById('thirdMost').innerText = top3Activities[2];

	// Displays stats found through graph in their appropriate spans.
	document.getElementById('longestActivityType').innerText = "bike";
	document.getElementById('shortestActivityType').innerText = "walk";
	document.getElementById('weekdayOrWeekendLonger').innerText = "Sunday";

	// Finds the number of each activity
	function numOfActivity() {
		let activityCountList = [];

		for (let activityType in activityCount) {
			const count = activityCount[activityType];
			activityCountList.push({ activityType, count });
		}
	
		return activityCountList;
	};
	const activityData = numOfActivity();

	// Organizes date, activity, and distance made into an object to be displayed on a graph and returns a list.
	function calcAvgDay() {
		let dataList = [];

		for (let i = 0; i < tweet_array.length; i++) {
			if (tweet_array[i].activityType == top3Activities[0] || tweet_array[i].activityType == top3Activities[1] || tweet_array[i].activityType == top3Activities[2]) {
				let myDate = new Date(tweet_array[i].time);
				let day_ = myDate.toLocaleDateString('en-US', { weekday: 'long'});
				
				let results = {
					Distance: tweet_array[i].distance,
					Day: day_,
					Activity: tweet_array[i].activityType
				};
				dataList.push(results);
			}
		}
		return dataList;
 	} 
	const dataList = calcAvgDay();

	// Organizes average distance by day ad activity, made into an object to be displayed on a graph and returns a list.
	function aggregateDay() {
		let aggregatedDataList = [];
		let aggregatedData = {};

		for (let i = 0; i < tweet_array.length; i++) {
			if (tweet_array[i].activityType == top3Activities[0] || tweet_array[i].activityType == top3Activities[1] || tweet_array[i].activityType == top3Activities[2]) {
				let myDate = new Date(tweet_array[i].time);
				let day_ = myDate.toLocaleDateString('en-US', { weekday: 'long'});

				let key = `${tweet_array[i].activityType}_${day_}`;
				
				if (!aggregatedData[key]) {
					aggregatedData[key] = {
						Day: day_,
						Activity: tweet_array[i].activityType,
						Distance: 0,
						Count: 0
					};
				}
				aggregatedData[key].Distance += tweet_array[i].distance;
				aggregatedData[key].Count++;
			}
		}
		for (let key in aggregatedData) {
			aggregatedData[key].averageDistance = aggregatedData[key].Distance / aggregatedData[key].Count;
			aggregatedDataList.push(aggregatedData[key]);
		}
		return aggregatedDataList;
	}
	const aggregateddataList = aggregateDay();

	// Visualization for plot #1 -- A graph of the number of Tweets containing each type of activity.
	const activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  "mark" : "point", 
	  "encoding" : {
		"x": {"field": "activityType", "type": "ordinal", "axis": {"title": "Activity Type"}},
        "y": {"field": "count", "type": "quantitative", "axis": {"title": "Number of Tweets"}},
        "color": {"field": "activityType", "type": "nominal", "legend": {"title": "Activity Type"}}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec)
		.catch(console.error);

	// Visualization for plot #2 -- A graph of the top three activites with the day they occured on, and the distance traveled.
	const activityByDayGraph = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the top three activites with the day they occured on, and the distance traveled.",
		"data": {
			"values": dataList
		},
		"mark": "point",
		"encoding": {
			"x": { "field": "Day", "type": "ordinal", "title": "Time (Day)","sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
			"y": { "field": "Distance", "type": "quantitative", "title": "Distance (in miles)" },
        	"color": { "field": "Activity", "type": "nominal" }
		}
	};
	vegaEmbed('#distanceVis', activityByDayGraph)
		.catch(console.error);

	// Visualization for plot #3 -- A graph of the top three activites with the average distance traveled, seperated by day and activity.
	const aggregatedByDayGraph = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the top three activites with the average distance traveled, seperated by day and activity.",
		"data": {
			"values": aggregateddataList
		},
		"mark": "point",
		"encoding": {
			"x": { "field": "Day", "type": "ordinal","title": "Time (Day)", "sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
			"y": { "field": "averageDistance", "type": "quantitative", "title": "Mean of Distance (in miles)"},
        	"color": { "field": "Activity", "type": "nominal" }
		}
	};
	
	// Changes the graph shown after the "show means" button is clicked.
	let currentGraph = 'aggregatedByDay';
	$('#aggregate').on('click', function () {
		if (currentGraph === 'activityByDay') {
			vegaEmbed('#distanceVis', activityByDayGraph).catch(console.error);
			$('#distanceVis').show();
			$('#distanceVisAggregated').hide();
			currentGraph = 'aggregatedByDay';
		} else if (currentGraph === 'aggregatedByDay') {
			vegaEmbed('#distanceVisAggregated', aggregatedByDayGraph).catch(console.error);
			$('#distanceVis').hide();
			$('#distanceVisAggregated').show();
			currentGraph = 'activityByDay';
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});