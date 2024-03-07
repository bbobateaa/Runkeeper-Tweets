let filteredWrittenTweets = [];

function parseTweets(runkeeper_tweets) {
    console.log("hello");
    // Do not proceed if no tweets loaded
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }
    document.getElementById('searchCount').innerText = 0;
    document.getElementById('searchText').innerText = '';
    filteredWrittenTweets = runkeeper_tweets
        .map(tweet => new Tweet(tweet.text, tweet.created_at))
        .filter(tweet => tweet.written);
    // TODO: Filter to just the written tweets
}

function addEventHandlerForSearch() {
    // TODO: Search the written tweets as text is entered into the search box, and add them to the table
    const searchInput = document.getElementById("textFilter");
    const tweetTable = document.getElementById("tweetTable");

    searchInput.addEventListener('input', function () {

        const searchText = searchInput.value.toLowerCase();

        if (searchText === '') {
            tweetTable.innerHTML = '';
            document.getElementById('searchCount').innerText = 0;
            document.getElementById('searchText').innerText = '';
            return;
        }

        // Filter the written tweets based on the search text
        const filteredTweets = filteredWrittenTweets.filter(tweet =>
            tweet.writtenText.toLowerCase().includes(searchText)
        );
        // Enters the amount of tweets that matched the keyword
        const numTweets = filteredTweets.length;
        document.getElementById('searchCount').innerText = numTweets;
        document.getElementById('searchText').innerText = searchText;

        tweetTable.innerHTML = '';
        // Enters the tweet data into the table
        tweetTable.innerHTML = filteredTweets.map((tweet, index) =>
            tweet.getHTMLTableRow(index + 1)
        ).join('');
    });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
    addEventHandlerForSearch();
    loadSavedRunkeeperTweets().then(parseTweets);
});
