Finense = {
	base1: "http://api.nse.com.ng/api",
	base2: "http://nseapi.com/api",
	public_key: "CD26022683",
	private_key: "KM27946924",
	sandbox: "127.0.0.1",
	type: "json",

// initializes the functions to be available when the DOM is ready
	init: function(){
		Finense.getStockSymbols(); 
		Finense.getTopGainers(); 
		Finense.getTopLosers(); 
		Finense.loadASIChart();
		Finense.getSymbol();
	},

// Loads the stock symbols from a local API in json format
	getStockSymbols: function(){
		$.get("js/symbols.json", function(response){
			$.each(response, function(){
				var symbols = this;
				$("#stock-ul").append('<li id="stock-li"><a href="' + symbols.Symbol + '">' + symbols.Symbol + '</a></li>');
			});
		});
	},

// Fetches the daily gainers and inserts them into a table
	getTopGainers: function(){
		$.getJSON(Finense.base1 + "/mrkstat/topsymbols", function(response){
			Finense.loadTable("#gainers tbody", response);
		});
	},

// Fetches the daily losers and inserts them into a table
	getTopLosers: function(){
		$.getJSON(Finense.base1 + "/mrkstat/bottomsymbols", function(response){
			Finense.loadTable("#losers tbody", response);
		});
	},

// Inserts gainers or losers data into a table
	loadTable: function(container, response){
		$.each(response, function(i){
			var table_row = "<tr><td>"+ response[i].ID +"</td>";
				table_row += "<td>" + response[i].SYMBOL + "</td>";
				table_row += "<td>" + response[i].LAST_CLOSE + "</td>";
				table_row += "<td>" + response[i].TODAYS_CLOSE + "</td>";
				table_row += "<td>" + response[i].PERCENTAGE_CHANGE + "</td></tr>";
			$(container).append(table_row);
		})
	},

// Fetches ASI data from the API
	loadASIChart: function(){
		$.getJSON("http://api.nse.com.ng/api/chartdata/ASI", Finense.ASIData);
	},

// Loads the data and calls the function to draw the chart (Callback Function)
	ASIData: function(response){
		console.log(response);
		var asi = response.IndiciesData;
		Finense.drawChart("#asi_chart", "All Share Index", "ASI", asi);
	},

// Draw the chart to the container supplied
// Takes container, title, name, data (array)
	drawChart: function(container, title, name, data){
		$(container).highcharts('StockChart', {
			chart: {
				backgroundColor: 'rgba(240,240,240, 0.1)',
				borderWidth: 1
			},

            rangeSelector : {
                selected : 5,
                inputEnabled: $('#asi_chart').width() > 480
            },

            title : {
                text : title
            },

            series : [{
                name : name,
                data : data,
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });
	},

	// Gets the symbol from the list item clicked
	getSymbol: function(){
		$("#stock-list li a").click(function(evt){
			evt.preventDefault();
			var symbol = this.attr("href");
			console.log(symbol);
			return symbol
		})
	}
}

$(document).ready(Finense.init);