var utils = require('utils');
var casper = require('casper').create();
var fs = require('fs');
var urls = require("urls.json");

casper.start(urls.BUILD_COPS_URL, function() {
  //Get current date, filter weekends
  var weekday = new Array( "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
  var months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
  var today = new Date();
  var currentDay = today.getDate();
  var currentMonth = months[today.getMonth()]; 
  var currentYear = today.getFullYear();
  var dayName = weekday[today.getDay()];
  
  if(dayName == "Sunday" ||  dayName == "Saturday"){
      console.log("No build Cop on Saturday or Sunday");
      this.exit();
  }

  console.log("Today: " + currentDay + "/" + currentMonth + "/" + currentYear);

  //get data from div  
  var buildCopDiv = this.evaluate(function() {
    return __utils__.getElementsByXPath('//div[@id="build-cops"]');
  });

  var yearsAndMonths = []
  var daysAndCops = []
  var divInfo = buildCopDiv.map(function(str) {
    var info = str.outerText.split("\n");
    for (var i = 0; i < info.length; i++) {
        var element = info[i];
        if(element.indexOf("Year") > -1 || element.indexOf("Dates") > -1){
          yearsAndMonths.push(element);
        }else{
          daysAndCops.push(element);
        }
    }
    return info;
  });  

  console.log("Years and Months: ");
  utils.dump(yearsAndMonths);

  console.log("Days and cops: ");
  utils.dump(daysAndCops);

  //parse months and years, putting everything in on line string
  var monthsAllTogether = "";
  for (var i = 0; i < yearsAndMonths.length; i++) {
    monthsAllTogether = monthsAllTogether + " " + yearsAndMonths[i];
  }

  var year = "Year";
  var dates = "Dates";
  var yearIndex = monthsAllTogether.indexOf(year);
  var dateIndex = monthsAllTogether.indexOf(dates);
  var yearsFromPage = monthsAllTogether.substring(yearIndex + year.length, dateIndex);
  var monthsFromPage = monthsAllTogether.substring(dateIndex + dates.length);

  //getting arrays of months + years
  var years = yearsFromPage.split("\t");
  var months = monthsFromPage.split("\t");

  //On Dec we should get the next year
  var monthYear = []
  var yearIndex = 1;
  for (var i = 1; i < months.length; i++) {
    if(months[i].indexOf("Dec") > -1){
      yearIndex++;
    }
    monthYear.push(months[i].trim() + years[yearIndex].trim());
  }

  console.log("Months and Years Parsed: ");
  utils.dump(monthYear);

  //get number of column for current month and year
  var monthIndexBuildCop = "";
  for (var i = 0; i < monthYear.length; i++) {
    if(monthYear[i] == (currentMonth + currentYear)){
      monthIndexBuildCop = i + 1;
      break;
    }
  }

  console.log("Month Index Build Cop: "  + monthIndexBuildCop);

  //getting day from div data 
  var dayAndCop = "";
  for (var i = 0; i < daysAndCops.length; i++) {
     var dayFromPage = daysAndCops[i].split("\t"); 
     if(dayFromPage[0] == currentDay){
        dayAndCop = dayAndCop + dayFromPage;
        //continue until find next day
        var k = i + 1;
        var nextdayFromPage = daysAndCops[k].split("\t"); 
        while(k < i && nextdayFromPage[0] != currentDay++){
          dayAndCop = dayAndCop + daysAndCops[k];
          k++;
          nextdayFromPage = daysAndCops[k].split("\t"); 
        }
     }
  }
  
  var buildCop = dayAndCop.split(","); 
  console.log("Build Cop: " + buildCop[monthIndexBuildCop]);
  fs.write("buildCop.txt", buildCop[monthIndexBuildCop], 'w');
});


casper.run();