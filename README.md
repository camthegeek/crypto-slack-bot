# crypto-slack-bot

Slack bot based on NodeJS
Utiltizes the following packages:
	@slack/client
	request


## What does it do?

Monitors node-cryptonote-pool based mining pools for new blocks and payouts and alerts specific channel
Retrieves information from pool on request
Basic math problems
Retrieves cryptocurrency values from CoinMarketCap
Allows users to calculate totals of specific currencies

## Setup
Create a bot on Slack. 
Be sure to save your bot's token ID. You will need it later.

Be sure to have node installed on your VPS or whatever you use. 

Open index.js, edit the variables at the top
token is the bot token ID from Slack;
botUserID is your bot's Slack user ID; This can also be retrieved from Slack.
trigger is the command trigger; set to something that can be easily accessed without causing confusion.

## PLEASE NOTE
This is a personal project. This is not something I plan to update on a regular basis. It has been fun to write and is actively used within a certain Monero Mining Slack group that I associate with.

Some of the code in this unused. Other parts are faulty. This is a work in progress. I can not gaurentee this will work on your system. 

