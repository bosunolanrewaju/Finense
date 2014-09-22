Finense = {
	base1: "http://api.nse.com.ng/api",

// initializes the functions to be available when the DOM is ready
	init: function(){
		Finense.getStockSymbols(); 
		Finense.getTopGainers(); 
		Finense.getTopLosers(); 
		Finense.loadASIChart();
		Finense.getSymbolList();
		Finense.getSymbolSelect();
		Finense.getMarketStatus();
		Finense.loadMarquee();
		$("#date").html(new Date().toString().substr(0, 15) + "<span id='time'></span>");
		$(document).on("click", "button", Finense.getPdf);
	},

// Loads the stock symbols from a local API in json format
	getStockSymbols: function(){
		$.get("js/symbols.json", function(response){
			$.each(response, function(){
				var symbols = this;
				$("#stock-ul").append('<li id="stock-li"><a href="' + symbols.Symbol + '">' + symbols.Symbol + '</a></li>');
				$("#stock-select").append("<option value='"+ symbols.Symbol +"'>"+symbols.Symbol+"</option>")
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
		$.getJSON(Finense.base1 + "/chartdata/ASI", Finense.ASIData);
	},

// Loads the data and calls the function to draw the chart (Callback Function)
	ASIData: function(response){
		var asi = response.IndiciesData;
		Finense.drawChart("#asi_chart", "All Share Index", "ASI", asi, 5);
	},

// Draw the chart to the container supplied
// Takes container, title, name, data (array)
	drawChart: function(container, title, name, data, selected){
		$(container).highcharts('StockChart', {
				chart: {
					backgroundColor: 'rgb(240,240,240)'
				},

		        loading: {
		     		hideDuration: 1000,
		            showDuration: 1000
		        },

	            rangeSelector : {
	                selected : selected,
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

	// Gets the symbol from the list item clicked and fetches the page to render the chart
	getSymbolList: function(){
		$(document).on ("click", "#stock-li a", function(evt){
			evt.preventDefault();
			var symbol = $(this).attr("href");
			Finense.getStockDetails(symbol);
			Finense.getStockPage(symbol);
		})
	},


	// Gets the symbol from the list item clicked and fetches the page to render the chart
	getSymbolSelect: function(){
		$(document).on ("change", "#stock-select", function(evt){
			var symbol = $("#stock-select option:selected").attr("value");
			if(symbol !== "0"){
				Finense.getStockDetails(symbol);
				Finense.getStockPage(symbol);
			}
		})
	},

	getStockPage: function(symbol){		
		$.get("stock.html", {symbol: symbol}, function(response){
			$("section").html(response);
			$("#chart h2").text(symbol);
		})
	},

	fetchSymbolData: function(symbol, symbolChart){
		var url = Finense.base1 + "/stockchartdata/" + symbolChart;
		$.getJSON(url, function(response){
			Finense.symbolData(symbol, response);
		});
	},

	symbolData: function(symbol, response){
		Finense.drawChart("#symbol_chart", symbol, symbol, response, 1);
		// Finense.getStockDetails(symbol);
	},


	setTodaysDate: function(){
		var today = new Date();
	    var dd = today.getDate();
	    var mm = today.getMonth()+1; //January is 0!

	    var yyyy = today.getFullYear();
	    if(dd<10){
	        dd='0'+dd
	    } 
	    if(mm<10){
	        mm='0'+mm
	    } 
	    var today = dd+'-'+mm+'-'+yyyy;
	    return today;
	},

	// Get market status
	getMarketStatus: function(){
		$.getJSON(Finense.base1 + "/statistics/mktstatus", function(response){
			if(response[0].MktStatus === "ENDOFDAY"){
				$("#market-status").css("background", "-webkit-linear-gradient( bottom, rgb(200,10,10), rgb(250,15,15))");
			} else {
				$("#market-status").css("background", "-webkit-linear-gradient( bottom, rgb(10,200,10), rgb(15,250,15))");
			}
		})
	},

	// market data marquee
	loadMarquee: function(){
		// Finense.base1 + "/statistics/ticker"
		$.getJSON(Finense.base1 + "/statistics/ticker", { $filter: "TickerType eq 'EQUITIES'"}, function(response){
				$.each(response, function(i){
					var content = response[i].SYMBOL + " ";
					content += response[i].Value + " ";
					content += response[i].PercChange + "% | ";
				$("#scroll marquee").append(content);
				});
			});
		Finense.setMarqueewidth();
	},

	getStockDetails: function(symbol){
		$.getJSON(Finense.base1 + "/issuers/companydirectory", {$filter: "Symbol eq '"+symbol+"'"}, function(response){
				if(response[0] !== undefined){
					Finense.fetchSymbolData(symbol, response[0].InternationSecIN);
					$("#chart h2").append(" (₦" + response[0].StockPriceCur + ")");
					if(response[0].StockPricePercChange > 0){
						$("#chart h2").append("<img src='img/up-arrow.png' alt='' /> " + response[0].StockPricePercChange + "%");
					} else if(response[0].StockPricePercChange < 0){
						$("#chart h2").append(" <img src='img/down-arrow.png' alt='' /> " + response[0].StockPricePercChange + "%");
					} else {
						$("#chart h2").append(" -- " + response[0].StockPricePercChange + "%");
					}
					$("#chart h2").append(" - " + Finense.nullParser(response[0].CompanyName));
					Finense.populateProfile(symbol, response);
				}
		})
	},

	populateProfile: function(symbol, response){
		$("#profile tr:first-child").append("<td>" + Finense.nullParser(response[0].CompanyName) + "</td>").next()
									.append("<td>" + symbol + "</td>").next()
									.append("<td>" + Finense.nullParser(response[0].Sector) + " (" + Finense.nullParser(response[0].SubSector) + ")</td>").next()
									.append("<td>" + Finense.nullParser(response[0].CompanyAddress) + "</td>").next()
									.append("<td>" + Finense.nullParser(response[0].Telephone) + " (" + Finense.nullParser(response[0].Fax) + ")</td>").next()
									.append("<td>" + Finense.nullParser(response[0].Email) + "</td>").next()
									.append("<td>" + Finense.nullParser(response[0].Website) + "</td>").next()
									.append("<td>" + Finense.nullParser(response[0].Auditor) + "</td>").next()
									.append("<td>" + Finense.nullParser(response[0].Registrars) + "</td>").next()
									.append("<td>" + Finense.nullParser(response[0].DateListed).substr(0, 10) + "</td>").next()
									.append("<td>" + Finense.nullParser(response[0].BoardOfDirectors) + "</td>")
	},

	nullParser: function(value){
		if(value !== null){
			return value;
		} else {
			return "N/A";
		}
	},

	setMarqueewidth: function(){
		var containerWidth = $("#wrapper").width();
		var marqueeWidth = containerWidth - ($("#date-time").width() + $("#market-status").width());
			marqueeWidth = ((marqueeWidth - 30) / containerWidth) * 100
			$("#scroll").css("width", marqueeWidth + "%");

	},

	getPdf: function(){
		console.log(window.location.href);
		window.open("//pdfcrowd.com/url_to_pdf/?use_print_media=1", "_blank");
	}
}

$(document).ready(Finense.init);