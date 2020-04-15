#!/usr/bin/env node
const axios = require('axios')
require('dotenv').config();
const chalk = require('chalk');
const minimist = require('minimist');
const inquirer = require('inquirer');
const fs = require('fs');
const figlet = require('figlet')
const args = require('minimist')(process.argv.slice(2));

if(args.c == undefined){
	printUsage();
}

var location_data;
var KEY ;
var apikey;
async function start(){
	var path = __dirname + '/apikey.txt';
fs.readFile(path, async (error, data)=>{
	if (error){
		const apiKey = await apiKeyquestion();
		apikey = apiKey.apikey;
		fs.writeFile(__dirname + '/apikey.txt', apikey, function(err) {
        	if (err) throw (err) 
    	    console.log("Apikey is created");
	    });
    	key();
	}
	else{
		apikey = data;
		key();
	}

	});
}

start();

function apiKeyquestion (){
	const questions = [
	{
		name: 'apikey',
        type: 'input',
        message: 'Please enter your api key:',
        validate: function( value ) {
		if (value.length) {
    	    return true;
			} else {
            return 'Please enter a apikey';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
}

async function key() {

	location_data = await axios.get('http://dataservice.accuweather.com/locations/v1/cities/search?apikey='+apikey+"&q="+ args.c);
	
	var len = Object.keys(location_data.data).length;
	
	var country = new Array();
	var region = new Array();
	var adminarea = new Array();
	var key = new Array();
		
	if (len>1)
	{
	 	for(var i=0;i<len;i++)
		{
 			country.push(location_data.data[i].Country.EnglishName)
			region.push(location_data.data[i].Region.EnglishName)
			adminarea.push(location_data.data[i].AdministrativeArea.EnglishName)
 			key.push(location_data.data[i].Key);
			console.log((i+1)+' '+args.c+', '+adminarea[i]+', '+country[i]+', '+region[i]+'\n');
		}
		const choice = await question();
		KEY = key[parseInt(choice.city) -1];

	}
	else{

		KEY = location_data.data[0].Key;
	}
	weatherData();
}

function question (){
	const questions = [
	{
		name: 'city',
        type: 'input',
        message: 'Please Choose one of the city and enter the coresponding number:',
        validate: function( value ) {
		if (value.length) {
    	    return true;
			} else {
            return 'Please enter a coresponding number.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
}

async function weatherData() {
	
	const weather_data = await axios.get('http://dataservice.accuweather.com/forecasts/v1/daily/1day/'+ KEY + '?apikey=' + apikey);
	var weather = weather_data.data.DailyForecasts[0].Temperature;
	var headline = weather_data.data.Headline.Text;
	var severity = weather_data.data.Headline.Severity;
	var unit = weather_data.data.DailyForecasts[0].Temperature.Minimum.Unit;
	var dayPhrase = weather_data.data.DailyForecasts[0].Day.IconPhrase;
	var nightPhrase = weather_data.data.DailyForecasts[0].Night.IconPhrase;
	var min = weather.Minimum.Value;
	var max = weather.Maximum.Value;
	
	min_C = ((min-32)*5/9).toFixed(2);
	max_C = ((max-32)*5/9).toFixed(2);

	printResult(headline, severity, unit, dayPhrase, nightPhrase, min_C, max_C);
}

function printUsage() {
	console.log(chalk.red("Error parameter not specified"));
	console.log("Usage: ");
	console.log("	-c: City Name");
	process.exit(1);
}

function printResult(headline, severity, unit, dayPhrase, nightPhrase, min, max){
	console.log(chalk.green(figlet.textSync('Weather', { horizontalLayout: 'full'})))
	console.log(chalk.red("--------------------Weather Updates--------------"));
	console.log("");
	console.log(chalk.yellow("		Headline: "+headline));
	console.log(chalk.cyan("		Severity: "+severity));
	console.log(chalk.yellow("		Minimum Temperature: "+min+' C'));
	console.log(chalk.cyan("		Maximum Temperature: "+max+' C'));
	console.log(chalk.yellow("		Day Phrase: "+dayPhrase));
	console.log(chalk.cyan("		Night Phrase: "+nightPhrase));
	console.log("");
	console.log(chalk.red("--------------------Report Ends--------------"));

}

