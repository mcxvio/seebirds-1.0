jQuery.fn.extend({		
	//http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000/
	filterNode: function(name) {
		return this.find('*').filter(function() {
			return this.nodeName === name; //gets all elements with name
		});
	}
});

jQuery.extend({
	getCurrentYear: function() {
		return new Date().getFullYear();
	}
})

jQuery.extend({
	spinner: function() {
		$(document).on("ajaxSend", function() {
			var $this = $( this ),
				theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
				msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
				textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
				textonly = !!$this.jqmData( "textonly" );
				html = $this.jqmData( "html" ) || "";
			$.mobile.loading( "show", {
					text: "loading",
					textVisible: true,
					theme: theme,
					textonly: textonly,
					html: html
			});
		})
		.on("ajaxStop", function() {
			$.mobile.loading( "hide" );
		});
	}
})

jQuery.extend({
	//http://stackoverflow.com/questions/905298/jquery-storing-ajax-response-into-global-variable
	getValues: function(url, dataType) {
		var result = null;
		$.ajax({
			url: url,
			type: 'get',
			dataType: dataType,
			async: false,
			success: function(data) {
				result = data;
			},
			error: function(xhr, status, error) {
				alert(error);
			} 
		});
		return result;
	}
});

jQuery.extend({
	populateAutocompletes: function(page, url, file) {
		var xml = $.getValues(url + file, "xml");
		var filteredList = $(xml).filterNode("region");
		
		var tags = (page == "checklists") ? "#autocomplete-items-checklists" : "#autocomplete-items-notables";
		var href = (page == "checklists") ? "#submissions" : "#sightings";
		
	    $(tags).on("filterablebeforefilter", function (e, data) {
	        var $ul = $(this),
	            $input = $(data.input),
	            value = $input.val(),
	            html = "";
	        $ul.html("");

	        if (value && value.length > 1) {
	            $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
	            $ul.listview("refresh");

				var val;
				$(filteredList).each(function () {
					val = $(this).filterNode("name").text() + " (" + ($(this).filterNode("subnational2-code").text() || $(this).filterNode("subnational1-code").text()) + ")"
					html += "<li><a href='" + href + "' class='gotoRegion'>" + val + "</a></li>";
				});
				
				$ul.html(html);
				$ul.listview("refresh");
				$ul.trigger("updatelayout");
			}
		});
	}
});

jQuery.extend({
	getAutocompleteNameTags: function(url) {
		// Retrieve raw XML data for autocomplete.
		var xml = $.getValues(url, "xml");
		var filteredList = $(xml).filterNode("region");
		var tags = [];
		
		$(filteredList).each(function () {
			tags.push($(this).filterNode("name").text() + " (" + ($(this).filterNode("subnational2-code").text() || $(this).filterNode("subnational1-code").text()) + ")");
		});

		return tags;
	}
});

jQuery.extend({
    getTableData: function(resultsToGet, regionToGet, region, search, locId, sciName) {
        var htmlTable = "";
		var ebirdData = "";
        
        if (search == "location") {
            var url = $.geteBirdApiUrl(locId, "location", "");
            ebirdData = $.getValues(url, "json");
            
            if (ebirdData.length > 0) {
                htmlTable = $.getLocationTable(ebirdData);
            }
        } 
        else if (search == "species") {
            var url = $.geteBirdApiUrl(region, "species", sciName);
            ebirdData = $.getValues(url, "json");
            
            if (ebirdData.length > 0) {
                htmlTable = $.getSpeciesTable(ebirdData, region);
            }
        } else {
            ebirdData = $.getData(resultsToGet, regionToGet, region, search);
            
            if (ebirdData.length > 0) {
                if (search == "checklists") {
                    htmlTable = $.getChecklistsTable(ebirdData, region);
                }
                if (search == "notables") {
                    htmlTable = $.getNotablesTable(ebirdData, region);
                }
            }
        }

		// http://stackoverflow.com/questions/3175687/how-best-to-implement-out-params-in-javascript
        return (htmlTable.rows.length > 0) ? { table: htmlTable, data: ebirdData.length } : "";
    }
});

jQuery.extend({
    getData: function(resultsToGet, regionToGet, region, search) {
        var data = "";
        var storedData = sessionStorage.getItem(resultsToGet);
        var storedRegion = sessionStorage.getItem(regionToGet);
        
		console.log('storedData__' + storedData + '__' + storedRegion);
        // Stored data present is for selected region.
        if ((storedData != null && storedData != "null") &&
        	(storedRegion != null && storedRegion != "null") && storedRegion == region) {
            console.log('session data... ' + storedData + ' ...');
            data = JSON.parse(storedData);
        } else { // No stored data, or region has changed.
            console.log('ebird data...');
            var url = $.geteBirdApiUrl(region, search, "");
            data = $.getValues(url, "json");
            
            storedData = JSON.stringify(data);
            
            sessionStorage.setItem(resultsToGet, storedData);
            sessionStorage.setItem(regionToGet, region);
        }
        
        return data;
    }
});

jQuery.extend({
	geteBirdApiUrl: function(selection, api, sciName) {
		var url = "";
		
		if (api == "location") {
			url = "//ebird.org/ws1.1/data/obs/hotspot/recent?r=" + selection + "&detail=full&includeProvisional=true&back=14&fmt=json";
		} else {
			var subregion = $.getSubRegionFromSelection(selection);
			var regex = /-/gi;
			
			if (api == "species") {
				var rtype = "subnational2";
				if (subregion.match(regex).length == 1) {
					rtype = "subnational1";
				}
				url = "//ebird.org/ws1.1/data/obs/region_spp/recent?rtype=" + rtype + "&r=" + subregion + "&sci=" + sciName + "&hotspot=true&includeProvisional=true&back=14&fmt=json";
			} else {
				rtype = "subnational1";
				if (subregion.length == 3) {
					rtype = "country";
					subregion = subregion.substring(0,2); //i.e., "US-" to "US"
				} else {
					if (subregion.match(regex).length == 2) {
						rtype = "subnational2";
					}
				}
				
				if (api == "notables") {
					url = "//ebird.org/ws1.1/data/notable/region/recent?rtype=" + rtype + "&r=" + subregion + "&detail=full&hotspot=true&back=5&fmt=json";
				} else if (api == "checklists") {
					url = "//ebird.org/ws1.1/data/obs/region/recent?rtype=" + rtype + "&r=" + subregion + "&hotspot=true&includeProvisional=true&back=5&fmt=json";
					console.log(url);
				}
			}
		}
		
		return url;
	}
});

jQuery.extend({
	populateIdentifySpecies: function(selectedData) {
		/*Start species session management*/
		if (selectedData.comName == "") {
			// Populate from session, passed back from identify page.
			console.log("get data FROM identify page");
			selectedData = JSON.parse(sessionStorage.getItem("identification"));
		} else {
			console.log("store data FOR identify page: " + JSON.stringify(selectedData));
			sessionStorage.setItem("identification", JSON.stringify(selectedData));
		}
		/*End species session management*/
		return selectedData;
	}
});

jQuery.extend({
	getSubRegionFromSelection: function(selection) {
		//http://stackoverflow.com/questions/17779744/regular-expression-to-get-a-string-between-parentheses-in-javascript		
		var regExp = /\(([^)]+)\)/;
		return selection.match(regExp)[1];
	}
});

jQuery.extend({
	getAppendRegion: function(selection) {
		return ($.getSubRegionFromSelection(selection).length == 3);
	}
});

jQuery.extend({
    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});

// START: Get Tables.
jQuery.extend({
	buildTableHeaders: function(idName, className, heading1, heading2, heading3, heading4, heading5) {
		var table = document.createElement("table");
        table.setAttribute("id", idName);
		table.setAttribute("class", className);
        table.setAttribute("data-role", "table");
        //table.setAttribute("data-mode", "columntoggle");
        
		var thead = document.createElement('thead');
		var tr = document.createElement('tr');
		var th1 = document.createElement('th');
		var th2 = document.createElement('th');

		th1.innerHTML = heading1;
		tr.appendChild(th1);
		th2.innerHTML = heading2;
		tr.appendChild(th2);

        if (heading3 != "") {
            var th3 = document.createElement('th');
            /*if (heading5 != "Observer") {
                th3.setAttribute("data-priority", "1");
            }*/
            th3.innerHTML = heading3;
            tr.appendChild(th3);
        }
        
		if (heading4 != "") {
            var th4 = document.createElement('th');
            //th4.setAttribute("data-priority", "2");
			th4.innerHTML = heading4;
			tr.appendChild(th4);
		}
        if (heading5 != "") {
            var th5 = document.createElement('th');
            //th5.setAttribute("data-priority", "3");
            th5.innerHTML = heading5;
            tr.appendChild(th5);
        }
       
		thead.appendChild(tr);
		table.appendChild(thead);
		
		return table;
	}
});

jQuery.extend({
	buildTableCell: function(cellData, row) {
		var cell = document.createElement('td');
		cell.innerHTML = cellData;
		row.appendChild(cell);
		return row;
	}
});

jQuery.extend({
	getChecklistsTable: function(data, selection) {
		var table = $.buildTableHeaders("submissionsTable", "tablesorter", "Hotspot", "Date", "Count*", "", "");
		var tbody = document.createElement('tbody');		
		
		var speciesCount = 0;
		var locNameDate = "";
		var prevLocNameDate = data[0].locName + ";" + data[0].obsDt;
		
		for (var i = 0; i < data.length; i++) {
			locNameDate = data[i].locName + ";" + data[i].obsDt;
				
			if (prevLocNameDate != locNameDate) {
				// add new row, i.e., check-list.
				var row = document.createElement('tr');

				var locName = '<a href="#location" class="gotoLocation" title="' + data[i-1].locID + '" target="_self">' + data[i-1].locName + '</a>';
				var howMany = speciesCount;
				var obsDt = $.formatDateTime('dd-M hh:ii', new Date(data[i-1].obsDt));
				
				row = $.buildTableCell(locName, row);
				row = $.buildTableCell(obsDt, row);
				row = $.buildTableCell(howMany, row);
				
				tbody.appendChild(row);
				
				speciesCount = 0;
				prevLocNameDate = locNameDate;
			} else {
				speciesCount++;				
			}
		}
		table.appendChild(tbody);

		return table;
	}
});

jQuery.extend({
	getNotablesTable: function(data, selection) {
		var table = $.buildTableHeaders("sightingsTable", "tablesorter", "Species", "Hotspot", "Count", "", "");
		var tbody = document.createElement('tbody');
        //var prevLocationDateTime = "";
        //var prevSpeciesName = "";
        var prevSubId = "";
        //var observers = "";

		for (var i = 0; i < data.length; i++) {
			var row = document.createElement('tr');
            
			var species = '<a href="#species" class="gotoSpecies" title="'+ data[i].comName + ' (' + data[i].sciName + ')' + '" target="_self">' + data[i].comName + '</a>';
			//var obsDt = '<a href="http://ebird.org/ebird/view/checklist?subID=' + data[i].subID + '" target="_blank">' + data[i].obsDt + '</a>';
			var howMany = data[i].howMany || 'X'; //ternary operator.
            //var userName = data[i].userDisplayName;
            var locName = '<a href="#location" class="gotoLocation" title="' + data[i].locID + '" target="_self">' + data[i].locName + '</a>';
            
            //console.log(data[i].comName + ', ' + data[i].subID + ', ' + data[i].obsDt + ', ' + data[i].userDisplayName + ', ' + locName);
            
            // Show different checklists as a row.
            if (prevSubId != data[i].subID) {
                var submitted = '<a href="https://ebird.org/ebird/view/checklist?subID=' + data[i].subID + '" target="_blank">' + $.formatDateTime('dd-M hh:ii', new Date(data[i].obsDt)) + '</a> by ' + data[i].userDisplayName;
                var submitRow = document.createElement('tr');
                var cell = document.createElement('th');
                cell.setAttribute("colspan", "3");
                cell.setAttribute("class", "header");
                cell.innerHTML = submitted;
                submitRow.appendChild(cell);
                tbody.appendChild(submitRow);
                prevSubId = data[i].subID;
            }
            if (prevSubId == data[i].subID) {
                row = $.buildTableCell(species, row);
                row = $.buildTableCell(locName, row);
                row = $.buildTableCell(howMany, row);
            }

			tbody.appendChild(row);
		}
		table.appendChild(tbody);
		return table;
	}
});

jQuery.extend({
	getLocationTable: function(data) {
		var table = $.buildTableHeaders("locationTable", "tablesorter", "Species", "Count", "", "", "");
		var tbody = document.createElement('tbody');
        var previousDate = "";

		for (var i = 0; i < data.length; i++) {
			var row = document.createElement('tr');
			
			var species = '<a href="#species" class="gotoSpecies" title="'+ data[i].comName + ' (' + data[i].sciName + ')' + '" target="_self">' + data[i].comName + '</a>';
			var howMany = data[i].howMany || 'X'; //ternary operator.
			var obsDt = "";
            
            // Show different visit dates as a row.
            if (previousDate != data[i].obsDt) {
                obsDt = '<a href="https://ebird.org/ebird/view/checklist?subID=' + data[i].subID + '" target="_blank">' + $.formatDateTime('dd-M hh:ii', new Date(data[i].obsDt)) + '</a> by ' + data[i].userDisplayName;
                var dateRow = document.createElement('tr');
                var cell = document.createElement('th');
                cell.setAttribute("colspan", "2");
                cell.setAttribute("class", "header");
                cell.innerHTML = obsDt;
                dateRow.appendChild(cell);
                tbody.appendChild(dateRow);
                previousDate = data[i].obsDt;
            }
			row = $.buildTableCell(species, row);
			row = $.buildTableCell(howMany, row);
			
			tbody.appendChild(row);
		}
		
		table.appendChild(tbody);
		return table;
	}
});

jQuery.extend({
	getSpeciesTable: function(data, regName) {
		var table = $.buildTableHeaders("speciesTable", "tablesorter", "Hotspot", "Date", "Count", "", "");
		var tbody = document.createElement('tbody');

		for (var i = 0; i < data.length; i++) {
			var row = document.createElement('tr');

			var location = '<a href="#location" class="gotoLocation" title="' + data[i].locID + '" target="_self">' + data[i].locName + '</a>';
			var count = data[i].howMany || 'X';
			var date = $.formatDateTime('dd-M hh:ii', new Date(data[i].obsDt));

			row = $.buildTableCell(location, row);
			row = $.buildTableCell(date, row);
			row = $.buildTableCell(count, row);
			
			tbody.appendChild(row);
		}
		
		table.appendChild(tbody);
		return table;
	}
});
// END: Get Tables.
