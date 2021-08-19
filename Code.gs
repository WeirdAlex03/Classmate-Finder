// Announces classes included in Apps Script to JSHint
/* globals FormApp,ScriptApp,Logger,UrlFetchApp */

/**
 * Creates a form submit trigger if one does not already exist
 */
// eslint-disable-next-line no-unused-vars -- Manually called from GUI
function createFormTrigger() {
	/** @type {Form} */
	var form = FormApp.getActiveForm();

	/** @type {Trigger[]} */
	var triggers = ScriptApp.getUserTriggers(form);

	/** @type {?Trigger} */
	var existingTrigger = null;

	// Look for an ON_FORM_SUBMIT trigger
	for (var i = 0; i < triggers.length; i++) {
		if (triggers[i].getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT) {
			existingTrigger = triggers[i];
			break;
		}
	}

	// If there is no trigger, create one
	if (!existingTrigger) {
		ScriptApp.newTrigger("onSubmit")
			.forForm(form)
			.onFormSubmit()
			.create();
	}
}

/**
 * Sends a POST request to the database server. I couldn't figure out how to
 * read it when it's an actual payload so it's just converted to URL paramters
 * 
 * @param {Object} payload - The object to send to the DB
 */
function postToDB(payload) {
	/**
	 * The domain and path of the database server 
	 * @type {string}
	 */
	const BASE_URL = "https://Classmate-Finder-Database.weirdalex03.repl.co/form";

	/** 
	 * Additional parameters for the request; sets the method to POST
	 * @type {Object}
	 */
	const options = { method: "post" };

	/** 
	 * The full URL of the request with the payload encoded as paramaters
	 * @type {string} 
	 */
	var url = BASE_URL + "?";

	// Adds each property to the URL as a parameter
	for (var property in payload) {
		url += encodeURIComponent(property) + "="
		     + encodeURIComponent(payload[property]) + "&";
	}

	// Sends POST request to the database server with the payload as parameters
	UrlFetchApp.fetch(url, options);

}

/**
 * Send data to database server
 * 
 * @param {Object} e - The event parameter created by a form submission;
 *      see https://developers.google.com/apps-script/guides/triggers/events#google_forms_events.
 */
// eslint-disable-next-line no-unused-vars -- Called by trigger on form submit
function onSubmit(e) {
	/**
	 * Make sure the script has necessary permissions
	 * @todo I don't think this is the right way to do this
	 */
	if (e.authMode !== ScriptApp.AuthMode.FULL) {
		throw new Error("Permission level is not FULL");
	}

	/** @type {ItemResponse[]} */
	var responses = {};

	/** @type {number} */
	var numClasses = 0;

	// Loads the form responses into an object & count "Class" questions
	for (var response of e.response.getItemResponses()) {
		responses[response.getItem().getTitle()] = response.getResponse();
		if (response.getItem().getTitle() === "Class") {
			numClasses++;
		}
	}

	// Add number of class questions to the payload
	responses["Class Entries"] = numClasses;

	// Sends the responses to the database server
	postToDB(responses);

}
