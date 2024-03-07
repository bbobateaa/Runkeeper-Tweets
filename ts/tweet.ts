class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        if (this.text.startsWith("Watch my") && this.text.includes("#RKLive")) {
            return "live_event";
        } else if (this.text.startsWith("Achieved a new personal record") && this.text.includes("#FitnessAlerts")) {
            return "achievement";
        } else if (this.text.startsWith("Just completed a") || this.text.startsWith("Just posted a")) {
            return "completed_event";
        } else {
            return "miscellaneous";
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        let index = this.text.indexOf(" https");
        const new_text = this.text.substring(0, index)
        if (!new_text.includes("Check it out!") && !new_text.includes("TomTom MySports Watch")) {
            return true;
        }
        return false;
    }

    // Checks if a tweet contains written text.
    get writtenText():string {
        if (!this.written) {
            return "";
        }

        let index = this.text.length;

        const hashtagIndex = this.text.indexOf("#");
        const httpsIndex = this.text.indexOf("https");

        if (hashtagIndex !== -1 && httpsIndex !== -1) {
            index = Math.min(hashtagIndex, httpsIndex);
        } else if (hashtagIndex !== -1) {
            index = hashtagIndex;
        } else if (httpsIndex !== -1) {
            index = httpsIndex;
        }

        return this.text.substring(0, index);
    }

    get httpLink():string {
        // parses the http link from the tweeet
        if (!this.written) {
            return "";
        }
        const linkRegex = /(https?:\/\/[^\s]+)/;
        const match = this.text.match(linkRegex);

        return match ? match[0] : "";
    }

    get httpHash(): string[] {
                // parses the http link from the tweeet
        if (!this.written) {
            return [];
        }
        const hashtagRegex = /#\S+/g;
        const hashtagMatches = this.text.match(hashtagRegex);
        const hashtags = hashtagMatches ? hashtagMatches : [];
        return hashtags;
    }

    get activityType():string {
        // Checks if the tweet is categorized as a completed_event.
        if (this.source != 'completed_event') {
            return "unknown";
        } 
        // Parses the activity type from the text of the tweet.
        if (this.text.includes("run")) {
            return "run";
        } else if (this.text.includes("bike")) {
            return "bike";
        } else if (this.text.includes("swim")) {
            return "swim";
        } else if (this.text.includes("walk")) {
            return "walk";
        } else if (this.text.includes("workout")) {
            return "workout";
        } else if (this.text.includes("hike")) {
            return "hike";
        } else if (this.text.includes("row")) {
            return "row";
        }
        else {
            return "unknown";
        }
    }

    // Finds the distance in activity and converts it to miles.
    get distance():number {
        if (this.source !== 'completed_event') {
            return 0;
        }
    
        const distanceMatch = this.text.match(/(\d+(\.\d+)?)\s*(mi|km)/i);
    
        if (distanceMatch && distanceMatch.length >= 4) {
            const distanceValue = parseFloat(distanceMatch[1]);
            const unit = distanceMatch[3].toLowerCase();
            if (unit === 'mi') {
                 // Return distance in miles
                return distanceValue;
            } else if (unit === 'km') {
                // Convert km to miles (1 km ≈ 0.621371 miles)
                return distanceValue * 0.621371;
            }
        }
        return 0;
    }

    //returns a table row which summarizes the tweet with a clickable link to the RunKeeper activity
    getHTMLTableRow(rowNumber:number):string {
        // returns a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const link = this.httpLink ? `<a href="${this.httpLink}" target="_blank">${this.httpLink}</a>` : "";
        const hash = this.httpHash.map(hashtag => `<a href="${hashtag}" target="_blank">${hashtag}</a>`).join(" ");
        return `<tr><td>${rowNumber}</td><td>${this.activityType}</td><td>${this.writtenText} ${hash} ${link}</td></tr>`;
    }
}