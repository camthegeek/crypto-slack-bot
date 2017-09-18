// set some variables for later use;
var Slack = require('@slack/client');
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var request = require("request");
var RtmClient = Slack.RtmClient;
var RTM_EVENTS = Slack.RTM_EVENTS;
var token = 'xoxb-REPLACE-ME';
var rtm = new RtmClient(token, { logLevel: 'info' });
var wtoken = token;
var web = new WebClient(wtoken);
var lastBlock;
var locked = false;
var botUserID = 'UREPLACEME';
var trigger = '!';

// No real need to edit anything below this.. but you can if you want.

rtm.start();

//anti spam.
function unlock()  {
	locked = false;
	console.log('Ready for command..')
}
function activateLock() { 
	locked = true;
	setTimeout(unlock, 3000);
	console.log('Anti-spam enabled');
}

rtm.on(RTM_EVENTS.MESSAGE, function(message) {  
  var channel = message.channel;
  var text = message.text;
  var user = message.user;
  var privChan = 'G69RF6ED6';
  if (user != botUserID) { 
    if (!locked) {
      try { 
        if (text.charAt(0) == trigger) { 
          var command = text.toLowerCase().substr(text.indexOf(trigger)+1)
          if (command != "") { 
            rtm.sendMessage('<@'+user+'> triggered me using: ' +command, privChan);
            if (command == "help") {
              activateLock();
              web.chat.postMessage(channel,"<@"+ message.user + ">, these are my current commands: *!faq*, *!last [block/payout]*, *!network*, *!pool*, *!value [coin]*, *!calc [basic math]* *!total [#] [coin]*.", { as_user:  true,  });
              web.chat.postMessage(channel,"I am a work in progress Some things may malfunction. My objective is to let you know when a block is found!", { as_user:  true,  });
            }

            if (command == "network") { 
              activateLock();
              getWebStats();
              if (connectionError == "1") { 
                rtm.sendMessage("Can not communicate with pool API. Something is not right. . .",channel);
              }
              if (connectionError == "0") {
                function doNetworkMessage() { 
                  var readableNetwork = getReadableHashRateString(netHash);
                  rtm.sendMessage('*Current Network Hashrate:* ' +readableNetwork+ '/sec', channel);
                  rtm.sendMessage("*Current Network Difficulty:* " +networkDifficulty, channel);
                  rtm.sendMessage("*Current Block Height:* " +networkHeight, channel);
                  console.log(networkLBFT);
                  networkBD = new Date(networkLBFT*1000);
                  console.log(networkBD);
                  var nfoundDate = networkBD;
                  var nfoundDateLocal = networkBD.toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
                  console.log(nfoundDateLocal);
                  var now = new Date();
                  var diff = Math.abs(nfoundDate-now);
                  var minutes = Math.floor((diff/1000)/60);
                  var hours = Math.floor (minutes/60);
                  var seconds = Math.floor(minutes*60);
                  if (minutes <= 0) { 
                    rtm.sendMessage("*Last Block Found:* " +seconds+ " seconds ago", channel); 
                  }
                  if (minutes >= 1) { 
                    rtm.sendMessage("*Last Block Found:* " +minutes+ " minutes ago", channel); 
                  }
                }
                setTimeout(doNetworkMessage, 1250);
              }
            }
            if (command == "nb") {
              newBlockCheck();
            }

            if (command == "pool") { 
              activateLock();
              getWebStats();
              if (connectionError == "1") { 
                rtm.sendMessage("Can not communicate with pool API. Something is not right. . .",channel);
              }
              if (connectionError == "0") {
                function doPoolMessage() { 
                  myDate = new Date(bf*1);
                  var foundDate = myDate;
                  var foundDateLocal = myDate.toLocaleString();
                  var now = new Date();
                  var diff = Math.abs(foundDate-now);
                  var minutes = Math.floor((diff/1000)/60);
                  var hours = Math.floor (minutes/60);
                  var hours2 = (minutes/60);
                  console.log (hours2);
                  var blockFoundEvery = (((netDiff/poolHash)/60)/60).toFixed();
                  console.log('blockFoundEvery='+blockFoundEvery);
                  console.log('hours2='+hours2);
                  var overdueBlockPercentage = ((hours2/blockFoundEvery)*100).toFixed();
                  console.log(overdueBlockPercentage);
                  var overDue = (overdueBlockPercentage-100).toFixed();
                  var readablePool = getReadableHashRateString(poolHash);
                  rtm.sendMessage('*Current Pool Hashrate:* ' +readablePool+ '/sec', channel);
                  rtm.sendMessage('*Estimated time per block:* ' +blockFoundEvery + ' hour(s)', channel)
                  rtm.sendMessage('*Miners connected:* ' +poolMiners, channel);
                  rtm.sendMessage('*Hashes submitted since last block:* ' +submittedHashes, channel);
                  rtm.sendMessage('*Pool % of Network*: ' +poolNetworkPercentage+ '%', channel);
                  if (hours < 1) { 
                    rtm.sendMessage("*Last Block Found:* " + minutes + " minutes ago", channel);
                    if (hours2 <= blockFoundEvery) {
                      rtm.sendMessage('*Current Effort:* ' +overdueBlockPercentage+ "%", channel); 
                    }
                  }
                  if (hours >= 2) { 
                    rtm.sendMessage('*Last Block Found:* ' +hours+ ' hours ago', channel); 
                    if (hours2 <= blockFoundEvery) {
                      rtm.sendMessage('*Current Effort:* ' +overdueBlockPercentage+ "%", channel); 
                    } 
                    if (hours2 >= blockFoundEvery) { 
                      rtm.sendMessage('*Current Effort:* ' +overdueBlockPercentage+ "%", channel); 
                    }
                  }
                  if (hours == 1) { 
                    rtm.sendMessage('*Last Block Found:* ' +hours+ ' hour ago', channel); 
                    if (hours2 <= blockFoundEvery) {
                      rtm.sendMessage('*Current Effort:* ' +overdueBlockPercentage+ "%", channel); 
                    }
                  }
                  rtm.sendMessage('We have found a total of *' +totalBlocks+ ' blocks* and made *' +totalPayments+ ' payments* to *' +minersPaid+ ' miners* since the pool began!', channel);
                }
                setTimeout(doPoolMessage, 1250);
              }
            }

            if (command.indexOf("value") >=0) { 
              activateLock();
              var split = text.split(" ");
              if (split[0] === trigger+"value") { 
                if (split.length == 1) { 
                  rtm.sendMessage('Correct syntax is \"!value coin\" where coin is your desired currency. There are over 1000 coins available to query.', channel);
                  rtm.sendMessage('Most common: *BTC*, *XMR*, *ETH*, *ETC*, *DASH*, *LTC*, *ZEC*, *BCC*, *STEEM*, *BCN*, *SC*, *DOGE*, *DCR*, *GAME*, *KMD*', channel);
                }
                console.log(split.length);  
                if (split.length > 1) {
                  currencyQueried = split[1];
                  currencyQueried = currencyQueried.toUpperCase();
                  currencyQueried = currencyQueried.replace(/\r?\n|\r/g, "");
                  console.log("Checking the value of " +currencyQueried);
                  if (currencyQueried) { 
                    cmcValue();
                    setTimeout(valueContinueCMC, 2000);
                    function valueContinueCMC() { 
                      if (cmcPassed == "0") { 
                        var ctqU = currencyQueried.toUpperCase();
                        rtm.sendMessage('Coin ' +ctqU+ ' not supported. Please see !value', channel);
                      }
                      if (cmcPassed == "1") { 
                        var ctqU = currencyQueried.toUpperCase()
                        if (currencyQueriedTwentyFourHourValue > 0) { 
                          rtm.sendMessage('*Currency:* ' +currencyQueriedName+ ' *Symbol:* ' +currencyQueried+ ' *USD Value:* $'+currencyQueriedValueUSD+ ' *BTC Value:* '+currencyQueriedValueBTC+ ' *CMC Rank:* #' +currencyQueriedRank+ ' * 24 Hour Change* ' +currencyQueriedTwentyFourHourValue+ '% :grnua: *Link:* https://coinmarketcap.com/currencies/'+currencyQueriedID, channel);
                        }
                        if (currencyQueriedTwentyFourHourValue < 0) { 
                          rtm.sendMessage('*Currency:* ' +currencyQueriedName+ ' *Symbol:* ' +currencyQueried+ ' *USD Value:* $'+currencyQueriedValueUSD+ ' *BTC Value:* '+currencyQueriedValueBTC+ ' *CMC Rank:* #' +currencyQueriedRank+ ' * 24 Hour Change* ' +currencyQueriedTwentyFourHourValue+ '% :redda: *Link:* https://coinmarketcap.com/currencies/'+currencyQueriedID, channel);
                        }
                      }
                    }
                  }
                }
              }
            }

            if (command.indexOf("faq") >= 0) {
              activateLock();
              var split = text.split(" ");
              if (split[0] === trigger+"faq") { 
                if (split.length == 1) {
                  rtm.sendMessage("Here is our faq: https://v2.usxmrpool.com/faq", channel); 
                }
                var name = split[1];
                if (split.length > 1) {

                  if (name.charAt(0) != '@' && name.charAt(0) != '<') { 
                    web.chat.postMessage(channel,"*<@"+ name + ">*, here is our faq: https://v2.usxmrpool.com/faq",{ as_user:  true,  });
                  }
                  if (name.charAt(0) == '<') { 
                    web.chat.postMessage(channel,"*"+ name + "*, here is our faq: https://v2.usxmrpool.com/faq",{ as_user:  true,  });
                  }
                }
              }
            }
            if (command.indexOf("calc") >= 0) {
              activateLock();
              var split = text.split(" ");
              if (split[0] == trigger+"calc") { 
                if (split.length == 1) {
                  rtm.sendMessage("Nothing to calculate. Give me a simple equation.", channel);
                }
                if (split.length > 1) { 
                  var equation2 = text.substr(text.indexOf(' ')+1);
                  var equation = split[1];
                  console.log(equation);
                  var doMathPlease = eval(equation2).toFixed(5);
                  console.log(doMathPlease);
                  rtm.sendMessage("*Result*: " +doMathPlease, channel);
                }
              }
            }

            if (command.indexOf("stats") >= 0) {
              sendTo = user;
              var cleanedText = text.replace(/\r?\n|\r/g, "");
              var split = cleanedText.split(" ");
              if (split[0] === trigger+"stats") { 
                walletAddress = split[1];
                if (split.length == 1) { 
                  rtm.sendMessage("The stats command fetches your mining stats from the website. I sent you, <@"+user+">, a private message regarding this command. Let's continue there. ", channel);
                  web.chat.postMessage(sendTo, "When using the stats command, lets keep it out of a public channel! To get your stats, simply type !stats followed by your Monero wallet address.", {as_user:true});
                }
                if (split.length > 1) {
                  console.log("This is the wallet address being checked: " +walletAddress);
                  getMinerStats();
                  if (connectionError == "1") { 
                    rtm.sendMessage("Can not communicate with pool API. Something is not right. . .",channel);
                  }
                  if (connectionError != "1") {
                    setTimeout(doMinerStats, 3500);
                    function doMinerStats() { 
                      if (minerError == "1") { 
                        web.chat.postMessage(sendTo,"No data was found for that wallet address.", {as_user: true});
                      }
                      if (minerError == "0") { 
                        web.chat.postMessage(sendTo,"Results for " +walletAddress, {as_user: true});
                        web.chat.postMessage(sendTo,"Hashrate: " +minerHashRate, {as_user: true});
                      }
                    }
                  }
                }
              }
            }
            if (command == "effort") { 
              activateLock();
              getWebStats();
              
              function showEfforts() { 
                var foundDate = myDate;
                var foundDateLocal = myDate.toLocaleString();
                var now = new Date();
                var diff = Math.abs(foundDate-now);
                var minutes = Math.floor((diff/1000)/60);
                var hours = Math.floor (minutes/60);
                var hours2 = (minutes/60);
                console.log (hours2);
                var blockFoundEvery = (((netDiff/poolHash)/60)/60).toFixed();
                console.log('blockFoundEvery='+blockFoundEvery);
                console.log('hours2='+hours2);
                var overdueBlockPercentage = ((hours2/blockFoundEvery)*100).toFixed();
                console.log(overdueBlockPercentage);
                var overDue = (overdueBlockPercentage-100).toFixed();
                rtm.sendMessage('*Current Effort To Next Block:* ' +overdueBlockPercentage+ "%", channel); 
              }
              setTimeout(showEfforts, 1250);
            }
// disabled command until I get it right.
            /* if (command.indexOf("luck") >= 0) { 
              activateLock();
              getWebStats();
              var maxResults = 0;
              var split = text.split(" ");
              console.log(split[0]+ " # " +split[1]);
              if (split[0] === trigger+"luck") { 
                if (split.length == 1) { 
                  rtm.sendMessage('Usage: !luck [# of blocks]', channel);
                  rtm.sendMessage('Calculates luck of number of blocks. Example: !luck 10 calculates luck of last 10 found blocks. Maximum amount of blocks is 32.', channel);
                }
                if (split.length > 1) { 
                  maxResults = split[1];
                  if (!isNaN(maxResults)) { 
                    if (maxResults > "30" || maxResults < "0") {
                      maxResults = "30";
                 }
                    var maxResults2 = maxResults * 2 - 2;
                    blockLuck = 0;
                    var totalShares = 0;
                    var totalDiffs = 0;
                    var orphanCount = 0;

                    function showLuck() {
                      var blocksInfo = blockInfoString.toString();
                      for(var i = 0; i < blockInfoString.length/2; i += 2) {
                        if (i>maxResults2) { 
                          break; 
                        }
                        console.log(blockInfoString[i]);
                        var parts = blockInfoString[i].split(':');
                        var processed = {
                          hash: parts[0],
                          time: parts[1],
                          difficulty: parseInt(parts[2]),
                          shares: parseInt(parts[3]),
                          orphaned: parts[4],
                          reward: parts[5]
                        }
                        totalShares += parseInt(processed.shares);
                        totalDiffs += parseInt(processed.difficulty);           
                      }
                      blockLuck = Math.round(totalShares / totalDiffs * 100);
                      rtm.sendMessage("Luck of last " +maxResults+ " blocks: " +blockLuck+ "%" , channel)
                    }
                    setTimeout(showLuck, 1250);
                  }
                }
              }
            } */

            if (command.indexOf("total") >= 0) {
              activateLock();
              var splitMain = text.split(" ");
              var values = text.substr(text.indexOf(' ')+1);
              var split = values.split(" ");
              if (splitMain[0] === trigger+"total") { 
                if (split.length == 1) { 
                  rtm.sendMessage('Usage: !total [amount] [coin]. Returns: [amount] [coin] = [coinAmount] USD', channel);
                  rtm.sendMessage('Quickly calculates value of coin in desired quantity.', channel);
                }
                if (split.length > 1) { 
                  currencyQueried = split[1];
                  currencyQueried = currencyQueried.toUpperCase();
                  currencyQueried = currencyQueried.replace(/\r?\n|\r/g, " ");
                  var currAmount = split[0];
                  var currAmount = currAmount.replace(/\r?\n|\r/g, " ");
                  console.log("Calculating the total of " +currAmount+ " " +currencyQueried)
                  if (currencyQueried) {
                    cmcValue();
                    setTimeout(valueContinueCMC2, 2000);
                    function valueContinueCMC2() { 
                      if (cmcPassed == "0") { 
                        var ctqU = currencyQueried.toUpperCase();
                        rtm.sendMessage('Coin ' +ctqU+ ' not supported. Please see !total', channel);
                      }
                      if (cmcPassed == "1") { 
                        var ctqU = currencyQueried.toUpperCase()
                        var mathedTotal = eval(currencyQueriedValueUSD*currAmount);
                        console.log(mathedTotal);
                        if (isNaN(mathedTotal)) { 
                          console.log("It was NaN");
                        } else {
                          var mathedTotal = mathedTotal.toLocaleString();
                          rtm.sendMessage(currAmount+ ' *' +currencyQueriedName+ '* = $*' +mathedTotal+ '* USD', channel); 
                        }
                      }
                    }
                  }
                }
              }
            }
            if (command == "cam") { 
              activateLock();
              rtm.sendMessage('<@camthegeek> is my awesome master.', channel);
            }

          /*  if (command == "here") { 
              activateLock();
              function doHere() { 
              rtm.sendMessage('I am still here despite what you think!', channel);
              }
              setTimeout(doHere, 4000);
            }*/

            if (command.indexOf("last") >= 0) {
              console.log('!last command ran');
              activateLock();
              var split = text.split(" ");
              if (split[0] === trigger+"last") { 
                if (split.length == 1) { 
                  rtm.sendMessage('Correct syntax is \"!last [option]\" where [option] is either *block* or *payout*.', channel);
                  rtm.sendMessage('Sample usage: !last *block* will show the time of the last block the pool mined. !last *payout* will give details on last payout from pool.', channel);
                }
                if (split.length > 1) {
                  var option = split[1];
                  var option = option.toLowerCase();
                  console.log('!last '+option);

                  getWebStats();
                  if (connectionError == "1") { 
                    rtm.sendMessage("Can not communicate with pool API. Something is not right. . .",channel);
                  }
                  if (connectionError == "0") {
                    function doLastBlockMessage() { 
                      myDate = new Date(bf*1);
                      var foundDate = myDate;
                      var foundDateLocal = myDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
                      var now = new Date();
                      var diff = Math.abs(foundDate-now);
                      minutes = Math.floor((diff/1000)/60);
                      hours = Math.floor (minutes/60);
                      if (hours < 1) { 
                        rtm.sendMessage("*Last Block*: " + foundDateLocal + " PDT. This was "+minutes+ " minutes ago", channel);
                      }
                      if (hours >= 1) { 
                        rtm.sendMessage("*Last Block*: " + foundDateLocal + " PDT. This was over "+hours + " hours ago..", channel); 
                      }
                    }
                    function doLastPayoutMessage() { 
                      var now = new Date();
                      var diff = Math.abs(paymentDate-now);
                      minutes = Math.floor((diff/1000)/60);
                      hours = Math.floor (minutes/60);

                      if (hours < 1) { 
                        var totalPay = payAmount*0.000000000001;
                        var totalPay = totalPay.toFixed(1);
                        rtm.sendMessage("*Last Payout*: " + payoutTime + " PDT. This was "+minutes+ " minutes ago. "+ payPayees + " miners were paid a total of " + totalPay + " XMR.", channel);
                      }
                      if (hours >= 1) { 
                        var totalPay = payAmount*0.000000000001;
                        rtm.sendMessage("*Last Payout*: " + payoutTime + " PDT. This was over "+hours + " hours ago. "+ payPayees + " miners were paid a total of " + totalPay + " XMR.", channel); 
                      }
                    }
                    if (option == 'block') { 
                      setTimeout(doLastBlockMessage, 1500);
                    }
                    if (option == 'payout') {
                      setTimeout(doLastPayoutMessage, 1500);
                    }
                  }
                }
              }
            }

            if (command == "block") { 
              activateLock();
              function getRandomBlockImage() { 
                var randomArray = [
                'http://webguru.xyz/lol/lolblocked1.gif',
                'http://webguru.xyz/lol/cube.gif',
                'http://webguru.xyz/lol/mario.gif',
                'http://orig06.deviantart.net/4d41/f/2011/118/4/c/minecraft_grass_block_by_blowjoe-d3f33pa.gif',
                'http://www.coqdiddles.com/wp-content/uploads/2014/08/mario-question-184x184.png',
                'https://i.imgur.com/4kYmOHF.gif'

                ];
                var rand = randomArray[(Math.random() * randomArray.length) | 0];
                rtm.sendMessage(rand,channel);
              }
              getRandomBlockImage();
            }
          }
        } 
      } catch (err) { 
        rtm.sendMessage('Error: ' +err, privChan);
      }
    }
  }
});

blockCheck();
setInterval(blockCheck, 300000);
paymentCheck();
setInterval(paymentCheck, 300000);
var blockInfoString;

// I took this from cryptonote pool code.. It was set to 1024 as far as hash to kilohash goes. Math did not add up. Changed to 1000, comes very close to what shows on pool page.
function getReadableHashRateString(hashrate){
	var i = 0;
	var byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH' ];
	while (hashrate > 1000){
		hashrate = hashrate / 1000;
		i++;
	}
	return hashrate.toLocaleString() + byteUnits[i];
}

var connectionError;
function getWebStats() {
	var checkTime = new Date();
	console.log(checkTime + ': Stats pulled from website. . .');
	request({
		uri: "http://107.161.19.75:8117/stats",
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'CamTheGeek-BlockBot-v1'
		},
		json: true
	}, function(error, response, body) {
		var responded = response.statusCode;
		if (responded != "200") { 
			connectionError = "1";
		}
		else { 
			connectionError = "0";
			console.log("connectionError" +connectionError)
			function dogetWebStats() { 
				lastPayment = body.pool.payments[1];
				var now = new Date();
				lastBlockFound = body.pool.lastBlockFound;
				myDate = new Date(lastBlockFound*1);
				var foundDate = myDate;
				var foundDateLocal = myDate.toLocaleString();
				var timeDifference = Math.abs(foundDate-now);
				var minutes = Math.floor((timeDifference/1000)/60);
				var hours = Math.floor(minutes/60);
				var ndiff = body.network.difficulty;
				netDiff = ndiff;
				networkDifficulty = ndiff.toLocaleString();
				var nTarget = body.config.coinDifficultyTarget;
				networkHashrateUF = (ndiff/nTarget);
				networkHashrate = ((ndiff/nTarget)*0.000001).toLocaleString();
				networkHeight = body.network.height.toLocaleString();
				networkLBFT = new Date(body.network.timestamp);
				networkLBFD = Math.abs(networkLBFT-now);
				netHash = ndiff/nTarget;
				poolHash = body.pool.hashrate;
				poolMiners = body.pool.miners;
				submittedHashes = body.pool.roundHashes.toLocaleString();
				minersPaid = body.pool.totalMinersPaid;
				totalBlocks = body.pool.totalBlocks;
				totalPayments = body.pool.totalPayments;
				poolNetworkPercentage = ((poolHash/networkHashrateUF)*100).toFixed(2);
				paymentDate = new Date(lastPayment*1000);
				payoutTime = paymentDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
				var payDate = paymentDate;
				var payNow = new Date();
				var diffTime = Math.abs(payDate-payNow);
				var payMinutes = Math.floor((diffTime/1000)/60);
				var payHours = Math.floor (payMinutes/60);
				var breakThisDown = body.pool.payments[0];
				var brokenDown = breakThisDown.split(":");
				payHash = brokenDown[0];
				payAmount = brokenDown[1];
				payMixin = brokenDown[3];
				payPayees = brokenDown[4];
				blockInfoString = body.pool.blocks;	

			}
			dogetWebStats();
		}
	});
}

var minerError;
function getMinerStats() {
	var checkTime = new Date();
	console.log(checkTime + ': Miner stats pulled from website. . .');
	request({
		uri: "http://107.161.19.75:8117/stats_address?address="+walletAddress,
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'CamTheGeek-BlockBot-v1'
		},
		json: true
	}, function(error, response, body) {
		var responded = response.statusCode;
		if (responded != "200") { 
			connectionError = "1";
		}
		else { 
			connectionError = "0";
			function doMinerStats() { 
				var success1 = body.error;
				console.log(success1)
				if (success1 == undefined) { 
					minerError = "0";
					console.log(minerError);
					minerBalance = body.stats.balance;
					minerSubmitedShares = body.stats.hashes;
					minerHashRate = body.stats.hashrate;
					minerLastShare = body.stats.lastShare;
				}
				if (success1 == "not found") { 
					minerError = "1";
					console.log(minerError);
				}
			}
			doMinerStats();
		}
	});
}

// the function for checking for blocks and pulling all the data we need from the API in one call. Core function for any data from the pool.
function blockCheck() {
	var checkTime = new Date();
	console.log(checkTime + ': Checking time of last block found.');
	request({
		uri: "http://107.161.19.75:8117/stats",
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'CamTheGeek-BlockBot-v1'
		},
		json: true
	}, function(error, response, body) {
		var responded = response.statusCode;
		if (responded != "200") { 
			connectionError = "1";
		}
		else {
			connectionError = "0";
			function doBlockCheck() { 
				console.log(body.pool.lastBlockFound);
				lbh = body.pool.blocks[1];
				bf = body.pool.lastBlockFound;
				myDate = new Date(bf*1);
				var foundDate = myDate;
				foundDateLocal = myDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
				blockFoundTime = foundDate;
				console.log(foundDateLocal);
				var now = new Date();
				var diff = Math.abs(foundDate-now);
				var minutes = Math.floor((diff/1000)/60);
				var hours = Math.floor (minutes/60);
				var blockInfoString = body.pool.blocks["0"];
				var blockInfo = blockInfoString.split(":");
				shares = blockInfo[3];
				hash = blockInfo[0];
				difficulty = blockInfo[2];
				timefound = blockInfo[1];
				console.log(minutes);
				var ndiff = body.network.difficulty;
				netDiff = ndiff;
				networkDifficulty = ndiff.toLocaleString();
				var nTarget = body.config.coinDifficultyTarget;
				networkHashrate = ((ndiff/nTarget)*0.000001).toLocaleString();
				networkHeight = body.network.height;
				netHash = ndiff/nTarget;
				poolHash = body.pool.hashrate;
				poolMiners = body.pool.miners;
				submittedHashes = body.pool.roundHashes.toLocaleString();
				minersPaid = body.pool.totalMinersPaid;
				totalBlocks = body.pool.totalBlocks;
				totalPayments = body.pool.totalPayments;
				if (minutes <= "5") { 
					setTimeout(doBFMessage, 4000);
				}
				if (minutes >= "6") { 
					console.log('Its been over '+minutes+' minutes since block was found.');  
				}
			}
			doBlockCheck();
		}
	});
}

function paymentCheck() {
	var checkTime = new Date();
	console.log(checkTime + ': Checking time of last payment..');
	request({
		uri: "http://107.161.19.75:8117/stats",
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'CamTheGeek-BlockBot-v1'
		},
		json: true
	}, function(error, response, body) {
		var responded = response.statusCode;
		if (responded != "200") { 
			connectionError = "1";
		}
		else {
			connectionError = "0";
			function dopaymentCheck() { 
				lastPayment = body.pool.payments[1];
				console.log(lastPayment);
				paymentDate = new Date(lastPayment*1000);
				payoutTime = paymentDate.toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
				var payDate = paymentDate;
				var payNow = new Date();
				var diffTime = Math.abs(payDate-payNow);
				var payMinutes = Math.floor((diffTime/1000)/60);
				var payHours = Math.floor (payMinutes/60);
				var breakThisDown = body.pool.payments[0];
				var brokenDown = breakThisDown.split(":");
				payHash = brokenDown[0];
				payAmount = brokenDown[1];
				payMixin = brokenDown[3];
				payPayees = brokenDown[4];
				if (payMinutes <= "5") { 
					setTimeout(doPaymentMessage, 4000);
				}
				if (payMinutes >= "6") { 
					console.log('Its been over '+payMinutes+' minutes since payments went out.');  
				}
			}
			dopaymentCheck();
		}
	});
}

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function(){  
	var secretChannel = "G69RF6ED6";
	console.log('connected and my channel is going to be '+secretChannel);
	rtm.sendMessage('I am still alive and doing okay...', secretChannel);
});

function stillAlive() { 
	var secretChannel = "G69RF6ED6";
	rtm.sendMessage('I am still alive and doing okay...', secretChannel);
}
setInterval(stillAlive, 1200000);

// special block found message. 
function doBFMessage() { 
	console.log('Block found!');
	var channel = '#pool-bot';
	var block = lbh;
	var diff = difficulty;

	function alertBlock() { var chan = 'channel'; web.chat.postMessage(channel, "Block! <!channel>", {as_user: true}); }
	setTimeout(alertBlock, 1000);

	function alertBlockTimeFound() {  web.chat.postMessage(channel, "Block Time Found:" +foundDateLocal+ " PDT", {as_user: true}); }
	setTimeout(alertBlockTimeFound, 1250);
}

// special payment sent message. 
function doPaymentMessage() { 
	console.log('Payout event happened!');
	var channel = '#pool-bot';

	function alertPayout() { 
		var chan = 'channel'; 
		web.chat.postMessage(channel, "*Payout!* <!channel>", {as_user: true}); 
	}
	setTimeout(alertPayout, 1000);

	function alertPayoutTime() {  
		web.chat.postMessage(channel, "Payout Occured:" +payoutTime, {as_user: true}); 
	}
	setTimeout(alertPayoutTime, 1150);

	function alertPayoutDetails() {  
		var totalPay = payAmount*0.000000000001;
		var totalPay = totalPay.toFixed(1);
		web.chat.postMessage(channel, "Payout Details: A payment of " +totalPay+ " XMR was sent out to " +payPayees+ " miners. View more at http://moneroblocks.info/search/"+payHash, {as_user: true}); 
	}
	setTimeout(alertPayoutDetails, 1250);
}


var passed;
// get value of coin function. 
function getValue() {
	var checkTime = new Date();
//var channel = '#cam';
if (!coinToQuery) { console.log('No coin given'); }
else {
	console.log(checkTime + ': Checking value of ' +coinToQuery);
	request({
		uri: "https://api.cryptonator.com/api/full/"+coinToQuery+"-usd",
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'CamTheGeek-BlockBot-v1'
		},
		json: true
	}, function(error, response, body) {
		var success = body.success;
		console.log(success);
		if (success == true) {
			passed = "1";
			value = body.ticker.price;
			value2 = parseFloat(value).toFixed(2);
			console.log('I was able to ping the coin. Here is my passed value'+passed);
		} 
		if (success == false) {
			passed = "0";
			console.log('I was not able to ping the coin. This is my passed:'+passed)
		}
	});
}
}

var cmcPassed;
function cmcValue() {
	request({
		uri: "https://api.coinmarketcap.com/v1/ticker/",
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'CamTheGeek-BlockBot-v1'
		},
		json: true
	}, function(error, response, body) {
		var found = 0;
		for (var i = 0; i < body.length - 1; i++) {
			if (body[i].symbol == currencyQueried) {
				var found = 1;
				console.log('I was able to find a value for ' +currencyQueried+ " on CoinMarketCap");
				cmcPassed = "1";
				currencyQueriedValueUSD = body[i].price_usd;
				currencyQueriedValueBTC = body[i].price_btc;
				currencyQueriedName = body[i].name;
				currencyQueriedID = body[i].id;
				currencyQueriedRank = body[i].rank;
				currencyQueriedTwentyFourHourValue = body[i].percent_change_24h;
			}
		}
		if (found == 0) { 
			cmcPassed = "0";
			console.log('Coin not found');
		}
	});
}