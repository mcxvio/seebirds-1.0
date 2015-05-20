jQuery.fn.extend({		
	//http://www.steveworkman.com/html5-2/javascript/2011/improving-javascript-xml-node-finding-performance-by-2000/
	filterNode: function(name) {
		return this.find('*').filter(function() {
			return this.nodeName === name; //gets all elements with name
		});
	}
});

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
    getData: function(resultsToGet, regionToGet, region, search) {
        var data = "";
        var storedData = sessionStorage.getItem(resultsToGet);
        var storedRegion = sessionStorage.getItem(regionToGet);
        
        // Stored data present is for selected region.
        if ((storedData != null && storedRegion != null) && storedRegion == region) {
            console.log('session data...');
            data = JSON.parse(storedData);
        } else { // No stored data, or region has changed.
            console.log('ebird data...');
            var url = $.geteBirdApiUrl(region, search);
            data = $.getValues(url, "json");
            
            storedData = JSON.stringify(data);
            
            sessionStorage.setItem(resultsToGet, storedData);
            sessionStorage.setItem(regionToGet, region);
        }
        
        return data;
    }
});

jQuery.extend({
	geteBirdApiUrl: function(selection, api) {
		var url = "";
		
		if (api == "location") {
			url = "http://ebird.org/ws1.1/data/obs/hotspot/recent?r=" + selection + "&detail=full&includeProvisional=true&back=14&fmt=json"
		} else {
			var subregion = $.getSubRegionFromSelection(selection);
			
			rtype = "subnational1";
			if (subregion.length == 3) {
				rtype = "country";
				subregion = subregion.substring(0,2); //i.e., "US-" to "US"
			} else {
				if (subregion.match(/-/gi).length == 2) {
					rtype = "subnational2";
				}
			}
			
			if (api == "notables") {
				url = "http://ebird.org/ws1.1/data/notable/region/recent?rtype=" + rtype + "&r=" + subregion + "&detail=full&hotspot=true&back=5&fmt=json";
			} else if (api == "checklists") {
				url = "http://ebird.org/ws1.1/data/obs/region/recent?rtype=" + rtype + "&r=" + subregion + "&hotspot=true&includeProvisional=true&back=5&fmt=json";
			}
		}
		
		return url;
	}
});

jQuery.extend({
	geteBirdSpeciesApiUrl: function(sciName, region, api) {
		var url = "";
		
		if (api == "species") {
			var subregion = $.getSubRegionFromSelection(region);
			
			var rtype = "subnational2";
			var regex = /-/gi;
			
			if (subregion.match(regex).length == 1) {
				rtype = "subnational1";
			}
			
			url = "http://ebird.org/ws1.1/data/obs/region_spp/recent?rtype=" + rtype + "&r=" + subregion + "&sci=" + sciName + "&hotspot=true&includeProvisional=true&back=14&fmt=json";
		}
		
		return url;
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

// START: Get Tables.
jQuery.extend({
	buildTableHeaders: function(idName, className, heading1, heading2, heading3, heading4, heading5) {
		var table = document.createElement("table");
        table.setAttribute("id", idName);
		table.setAttribute("class", className);
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        
		var thead = document.createElement('thead');
		var tr = document.createElement('tr');
		var th1 = document.createElement('th');
		var th2 = document.createElement('th');
        var th3 = document.createElement('th');

		if (heading5 != "Observer") {
            th3.setAttribute("data-priority", "1");
        }

		th1.innerHTML = heading1;
		tr.appendChild(th1);
		th2.innerHTML = heading2;
		tr.appendChild(th2);
        th3.innerHTML = heading3;
        tr.appendChild(th3);
        
		if (heading4 != "") {
            var th4 = document.createElement('th');
            th4.setAttribute("data-priority", "2");
			th4.innerHTML = heading4;
			tr.appendChild(th4);
		}
        if (heading5 != "") {
            var th5 = document.createElement('th');
            th5.setAttribute("data-priority", "3");
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
		var table = $.buildTableHeaders("sightingsTable", "tablesorter", "Location / Hotspot", "Date", "Recent Species", "", "");
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
				var obsDt = data[i-1].obsDt;
				
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
		var table = $.buildTableHeaders("sightingsTable", "tablesorter", "Species Name", "Location", "Date / Checklist", "Count", "Observer");
		var tbody = document.createElement('tbody');
        
		for (var i = 0; i < data.length; i++) {
			var row = document.createElement('tr');
			
			var species = '<a href="#species" class="gotoSpecies" title="'+ data[i].comName + ' (' + data[i].sciName + ')' + '" target="_self">' + data[i].comName + '</a>';
			var obsDt = '<a href="http://ebird.org/ebird/view/checklist?subID=' + data[i].subID + '" target="_blank">' + data[i].obsDt + '</a>';
			var howMany = data[i].howMany || 'X'; //ternary operator.
			var locName = '<a href="#location" class="gotoLocation" title="' + data[i].locID + '" target="_self">' + data[i].locName + '</a>';
            var userName = data[i].userDisplayName;
			
			row = $.buildTableCell(species, row);
			row = $.buildTableCell(locName, row);
			row = $.buildTableCell(obsDt, row);
			row = $.buildTableCell(howMany, row);
            row = $.buildTableCell(userName, row);

			tbody.appendChild(row);
		}
		
		table.appendChild(tbody);
		return table;
	}
});

jQuery.extend({
	getLocationTable: function(data) {
		var table = $.buildTableHeaders("locationTable", "tablesorter", "Species Name", "Date / Checklist", "Count", "", "");
		var tbody = document.createElement('tbody');

		for (var i = 0; i < data.length; i++) {
			var row = document.createElement('tr');
			
			var species = '<a href="#species" class="gotoSpecies" title="'+ data[i].comName + ' (' + data[i].sciName + ')' + '" target="_self">' + data[i].comName + '</a>';
			var howMany = data[i].howMany || 'X'; //ternary operator.
			var obsDt = '<a href="http://ebird.org/ebird/view/checklist?subID=' + data[i].subID + '" target="_blank">' + data[i].obsDt;
			
			row = $.buildTableCell(species, row);
			row = $.buildTableCell(obsDt, row);
			row = $.buildTableCell(howMany, row);
			
			tbody.appendChild(row);
		}
		
		table.appendChild(tbody);
		return table;
	}
});

jQuery.extend({
	getSpeciesTable: function(data, regName) {
		var table = $.buildTableHeaders("speciesTable", "tablesorter", "Location / Hotspot", "Date", "Count", "", "");
		var tbody = document.createElement('tbody');

		for (var i = 0; i < data.length; i++) {
			var row = document.createElement('tr');

			var location = '<a href="#location" class="gotoLocation" title="' + data[i].locID + '" target="_self">' + data[i].locName + '</a>';
			var count = data[i].howMany || 'X';
			var date = data[i].obsDt;

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
