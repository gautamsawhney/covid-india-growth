$(document).ready(function(){
  var addCommas = function(x) {
    x=x.toString();
    var lastThree = x.substring(x.length-3);
    var otherNumbers = x.substring(0,x.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return res;
  }

  let rate = []
  let total = 0;
  var monthNames = ["January", "February", "March", "April", "May","June","July", "August", "September", "October", "November","December"];
  let date = new Date();
  let day = date.getUTCDate();
  let month = monthNames[date.getMonth()]
  let todaysDate = day + " " + month
  $.get("https://api.covid19india.org/data.json", function(response){



    let history = response.cases_time_series;
    history.push({dailyconfirmed: response.key_values[0]['confirmeddelta'], date: todaysDate})

    history.forEach(function(data, index) {
      if (index == 0) {
        total = total + parseInt(data['dailyconfirmed'])
        rate.push({
          rate: 1,
          current: 0,
          past: 0,
          date: data.date
        });
        return;
      }

      var rate_calc = (100*parseInt(data['dailyconfirmed'])/total).toFixed(2);
      total = parseInt(total) + parseInt(data['dailyconfirmed'])

      rate.push({
          rate: rate_calc,
          current: total,
          past: (total - data['dailyconfirmed']),
          date: data.date
        }
      )

    })

    let last = rate.length - 1;
    rate[last]['current'] = parseInt(response['statewise'][0]['confirmed']);
    rate[last]['past'] = rate[last-1]['current']
    rate[last]['rate'] = (100*(rate[last]['current'] - rate[last]['past'])/(rate[last]['past'])).toFixed(2);


    $("#today-growth").html(rate[last]['rate'])
    $("#today-cases").html(rate[last]['current'])
    $("#today-new").html(rate[last]['current']-rate[last]['past'])
    $(".yesterday-growth").html(rate[last-1]['rate'])
    $("#yesterday-cases").html(rate[last-1]['current'])
    // debugger
    var yesterday_rate_prediction = Math.round(rate[last]['current']*Math.pow((100+parseFloat(rate[last-1]['rate']))/100,7))
    var yesterday_rate_prediction_30d = Math.round(rate[last]['current']*Math.pow((100+parseFloat(rate[last-1]['rate']))/100,30))
    $("#yesterday-rate-prediction").html(addCommas(yesterday_rate_prediction))
    $("#yesterday-rate-prediction-30d").html(addCommas(yesterday_rate_prediction_30d))

    var rate_7_day_sum = 0.0;
    for (var i = rate.length - 2; i >= rate.length - 8; i--) {
      rate_7_day_sum = rate_7_day_sum + parseFloat(rate[i]['rate']);
    }

    let rate_7_day_avg = (rate_7_day_sum/7)
    var seven_day_prediction = rate[last]['current']*(Math.pow(rate_7_day_avg,7))
    var seven_day_prediction = Math.round(rate[last]['current']*Math.pow((100+parseFloat(rate_7_day_avg))/100,7))
    var seven_day_prediction_30d = Math.round(rate[last]['current']*Math.pow((100+parseFloat(rate_7_day_avg))/100,30))

    $("#7-day-prediction").html(addCommas(seven_day_prediction))
    $("#7-day-prediction-30d").html(addCommas(seven_day_prediction_30d))

    $(".7-day-avg").html(rate_7_day_avg.toFixed(2));


    var ctx = $('#growth-trends');
    var labels = rate.map(function(x) { return x['date']}).slice(last - 21, last+1);
    var graph_rate_data = rate.map(function(x) { return x['rate']}).slice(last - 21, last+1);


    var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
          label: "% growth",
          data: graph_rate_data,
          backgroundColor: "#3e95cd"
      }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

    // let today = response.data[response.data.length - 1];
    // console.log(today);
  });
})
