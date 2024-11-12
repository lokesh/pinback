## To-do
- Remove calendar files from Github repo
- Add photo of calendar

# Pinback

View your Swarm check-ins in your calendar app.

This app does the following:
1. Fetches check-in data from Swarm API
2. Converts to iCalendar format
3. Uploads to AWS S3

You then can subscribe to these hosted calendar files in your calendar app of choice. To keep data fresh, run it daily.

> [!NOTE]
> Google Calendar refreshes subscribed calendars approximately every 24 hours. You cannot force a refresh.

## How to run with your own data

You'll need to do the following:
1. Get a Foursquare Oauth token for your user.
2. Save the calendar files to AWS S3.
3. Host this app and schedule it to run daily. I'll walk through using Vercel.

### 1. Get a Foursquare Oauth token

Before we get going, run `npm i` to install dependencies.

You can utilize the Foursquare API with an API key that is generated via the developer portal, but for certain data, including user check-ins, you'll need to use OAuth.

1. Go to https://foursquare.com/developers/login. Create a new developer account if you don't have one.
2. Create a new app in their developer portal.
3. In the Project Settings, enter http://www.google.com in the Redirect URL field. Take note that your Client ID and Client Secret are listed just above.
4. In your browser, navigate to the following URL:
```shell
https://foursquare.com/oauth2/authenticate
?client_id=YOUR_CLIENT_ID
&response_type=code
&redirect_uri=YOUR_REDIRECT_URI
```
5. Approve the app.
6. You should be redirected to `http://www.google.com/?code=YOUR_CODE`. Copy the code.
7. Run the following curl command to get the Oauth token:
```shell
curl -X POST "https://foursquare.com/oauth2/access_token" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=YOUR_REDIRECT_URI" \
  -d "code=CODE_RECEIVED_FROM_REDIRECT"
```
8. The response should include your access token.
9. Rename `.env.example` file to `.env` and populate `FOURSQUARE_OAUTH_TOKEN` with your access token.

#### 🤞 Fetch check-in data and convert to iCalendar format

1. Run `npm run fetch`. This should fetch the data and store in `checkins.json`.
2. Run `npm run ical`. This converts the check-in data to iCalendar format.

You should see one or more `calendar-xxxx-xxxx.ics` files in your project folder.

> [!NOTE]
> Rather than a single ICS file for all check-ins, we create multiple files for each 5-year period. This is to avoid hitting a possible 1MB file limit for subscribed calendars in Google Calendar -- the documentation on this is fuzzy.

### 2. Save the calendar files to AWS S3

1. Login to [AWS](https://aws.amazon.com/s3/) and click create a new S3 bucket. 
2. Uncheck the "Block all public access" box and acknowledge that this will make the bucket public.
3. We need to populate four different values in the `.env` file:
  - AWS_ACCESS_KEY_ID - Find this by clicking on your username in the top right corner and selecting "Security Credentials". Scroll down to the "Access keys" section and create a new access key.
  - AWS_SECRET_ACCESS_KEY - See above.
  - AWS_REGION - Go to your S3 bucket and click into the "Properties" tab. Look for something with the following format: `us-west-1`.
  - S3_BUCKET_NAME - This is the name of the bucket you created.

#### 🤞 Fetch check-in data and convert to iCalendar format

Run `npm run upload-all`. This will upload all of the calendar files to your S3 bucket.

Confirm that the files are in the bucket via the AWS console.

### 3. Host this app and schedule it to run daily


Code is hosted on heroku where it uses the scheduler to run `npm run start` daily at midnight. This task fetches new check-ins, converts to ics, and uploads to S3.

- `fetch.js` - fetch check-in data from Foursquare API
  - `npm run fetch` - fetches new check-ins and prepends to checkins.json
  - `npm run fetch-all` - fetches all check-ins and overwrites checkins.json
- `ical.js` - Converts data to iCalendar format
  - `npm run ical` - converts checkins.json to calendar.ics
- `upload.js` - Uploads data to AWS S3 bucket checkions-calendar
  - `npm run upload` - uploads ics file for current 5-year period
  - `npm run upload-all` - uploads all calendar ics files
- `dedupe-json.js` - Removes duplicate check-ins. Was an issue when I had buggy code.
- `categories.js` - Maps emoji to category. Used by ical.js

### Data files
- `checkins.json` - Raw check-in data
- `calendar-xxxx-xxxx.ics` - iCalendar data for current 5-year period