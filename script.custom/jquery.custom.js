var jQuery;
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
});

jQuery.extend({
	removeTypeaheadBgColorStyle: function(elementId) {
		if((document.getElementById) && (document.getElementById(elementId) != null)) {
			var element = document.getElementById(elementId);
			// Check the element's style object and background property are available.
		 	if ((element.style)&& (element.style.backgroundColor != null)) {
                element.style.backgroundColor = null;
  			}else {	
				// Property is not assigned or is not supported.
				return;
  			}
		} else {
		  return;
		}
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
    getOutputHtml: function(resultsToGet, regionToGet, region, search, locId, sciName) {
        var outputHtml = "";
		var ebirdData = "";
		var url = "";

        if (search == "location") {
            url = $.geteBirdApiUrl(locId, "location", "");
            ebirdData = $.getValues(url, "json");

            if (ebirdData.length > 0) {
                outputHtml = $.getLocationHtml(ebirdData, locId);
            }
        }
        else if (search == "species") {
            url = $.geteBirdApiUrl(region, "species", sciName);
            ebirdData = $.getValues(url, "json");

            if (ebirdData.length > 0) {
                outputHtml = $.getSpeciesHtml(ebirdData, region);
            }
        } else {
            ebirdData = $.getData(resultsToGet, regionToGet, region, search);

            if (ebirdData.length > 0) {
                if (search == "checklists") {
                    outputHtml = $.getChecklistsHtml(ebirdData, region);
                }
                if (search == "notables") {
                    outputHtml = $.getNotablesHtml(ebirdData, region);
                }
            }
        }

		return outputHtml;
    }
});

jQuery.extend({
    getData: function(resultsToGet, regionToGet, region, search) {
        var data = "";
        var storedData = sessionStorage.getItem(resultsToGet);
        var storedRegion = sessionStorage.getItem(regionToGet);

        // Stored data present is for selected region.
        if ((storedData != null && storedData != "null") &&
        	(storedRegion != null && storedRegion != "null") && storedRegion == region) {
            //console.log('session data... ' + storedData + ' ...');
            data = JSON.parse(storedData);
        } else { // No stored data, or region has changed.
            //console.log('ebird data...');
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
			url = "//ebird.org/ws1.1/data/obs/hotspot/recent?r=" + selection + "&detail=full&includeProvisional=true&back=10&fmt=json";
		} else {
			var subregion = $.getSubRegionFromSelection(selection);
			var regex = /-/gi;

			if (api == "species") {
				var rtype = "subnational2";
				if (subregion.match(regex).length == 1) {
					rtype = "subnational1";
				}
				url = "//ebird.org/ws1.1/data/obs/region_spp/recent?rtype=" + rtype + "&r=" + subregion + "&sci=" + sciName + "&hotspot=true&includeProvisional=true&back=10&fmt=json";
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
					//console.log(url);
				}
			}
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
	extractDatetimesFromResultsData: function (data) {
		/* Extract distinct datetimes from ebird json results */
		var lookup = {};
		var items = data;
		var result = [];

		for (var item, i = 0; item = items[i++];) {
		  var name = item.obsDt;

		  if (!(name in lookup)) {
		    lookup[name] = 1;
		    result.push(name);
		  }
		}
		return result;
	}
});

jQuery.extend({
	getUnorderedList: function () {
		var ul = document.createElement('ul');
		ul.setAttribute("data-role", "listview");
		ul.setAttribute("class", "ui-listview");
		return ul;
	}
});

jQuery.extend({
	getListItem: function (innerHtml) {
		var li = document.createElement('li');
		li.setAttribute("class", "ui-li-static ui-body-inherit");
		li.innerHTML = innerHtml;
		return li;
	}
});

jQuery.extend({
	getListItemDivider: function (innerHtml) {
		var lid = document.createElement('li');
		lid.setAttribute("data-role", "list-divider");
		lid.setAttribute("role", "heading");
		lid.setAttribute("class", "ui-li-divider ui-body-inherit");		
		lid.innerHTML = innerHtml;
		return lid;
	}
});

jQuery.extend({
	getSelectChecklistsNotablesMessage: function(message) {
		var ul = $.getUnorderedList();
		ul.appendChild($.getListItemDivider(message));
		return ul;
	}
});

jQuery.extend({
	getChecklistsHtml: function(data, selection) {
		var ul = $.getUnorderedList();
		var extractedDatetimes = $.extractDatetimesFromResultsData(data);
		var prevDate = "";
		/* Set date for dividing list item and use the date collection to extract summary of checklist data for display */
		for (var j = 0; j < extractedDatetimes.length; ++j) {
			var checklist = data.filter(function(i, n) { return i.obsDt == extractedDatetimes[j]; });
			var date = $.formatDateTime('dd-MM', new Date(extractedDatetimes[j].replace(/-/g , "/")));
			var time = $.formatDateTime('hh:ii', new Date(extractedDatetimes[j].replace(/-/g , "/")));
			var count = checklist.length;
			var location = '<a href="#location" class="gotoLocation" title="' + checklist[0].locID + '" target="_self">' + checklist[0].locName + '</a>';

			if (prevDate != date) {
				//write out date heading.
				ul.appendChild($.getListItemDivider(date));
				prevDate = date;
			}

			var innerHtml = count + " species @ " + location + " @ " + time;
			ul.appendChild($.getListItem(innerHtml));
		}
		ul.appendChild($.getListItem("&nbsp;"));
		/* Set message */
		var message = extractedDatetimes.length + " checklists with most recent species for " + selection + " in last 5 days.";
		ul.insertBefore($.getListItemDivider(message), ul.childNodes[0]);
		return ul;
	}
});

jQuery.extend({
	getNotablesHtml: function(data, selection) {
		var ul = $.getUnorderedList();
		var extractedDatetimes = $.extractDatetimesFromResultsData(data);
		/* Set date for dividing list item and use the date collection to extract summary of checklist data for display */
		var prevDate = "";
		var speciesCount = 0;
		for (var j = 0; j < extractedDatetimes.length; ++j) {
			var checklist = data.filter(function(i, n) { return i.obsDt == extractedDatetimes[j]; });
			var date = $.formatDateTime('dd-MM', new Date(extractedDatetimes[j].replace(/-/g , "/")));
			var time = $.formatDateTime('hh:ii', new Date(extractedDatetimes[j].replace(/-/g , "/")));

			if (prevDate != date) {
				//write out date heading.
				ul.appendChild($.getListItemDivider(date));
				prevDate = date;
			}

			for (var k = 0; k < checklist.length; k++) {
				var count = checklist[k].howMany || 'X'; //ternary operator.
				var species = '<a href="#species" class="gotoSpecies" title="'+ checklist[k].comName + ' (' + checklist[k].sciName + ')' + '" target="_self">' + checklist[k].comName + '</a>';
	            var location = '<a href="#location" class="gotoLocation" title="' + checklist[k].locID + '" target="_self">' + checklist[k].locName + '</a>';
    			var timeOut = '<a href="https://ebird.org/ebird/view/checklist?subID=' + checklist[k].subID + '" target="_blank">' + time + '</a>';
				var userName = checklist[k].userDisplayName;

				var innerHtml = count + " " + species + " @ " + location + " @ " + timeOut + "<br> -- " + userName;
				ul.appendChild($.getListItem(innerHtml));
				speciesCount++;
			}
		}
		ul.appendChild($.getListItem("&nbsp;"));		
		/* Set message */
		var message = speciesCount + " notable sightings for " + selection + " in last 5 days.";
		ul.insertBefore($.getListItemDivider(message), ul.childNodes[0]);
		return ul;
	}
});

jQuery.extend({
	getLocationHtml: function(data, locId) {
		var ul = $.getUnorderedList();
		var extractedDatetimes = $.extractDatetimesFromResultsData(data);
		/* Set date for dividing list item and use the date collection to extract summary of checklist data for display */
		var prevDate = "";
		var speciesCount = 0;
		for (var j = 0; j < extractedDatetimes.length; ++j) {
			var checklist = data.filter(function(i, n) { return i.obsDt == extractedDatetimes[j]; });
			var date = $.formatDateTime('dd-MM', new Date(extractedDatetimes[j].replace(/-/g , "/")));
			var time = $.formatDateTime('hh:ii', new Date(extractedDatetimes[j].replace(/-/g , "/")));

			if (prevDate != date) {
				//write out date heading.
				ul.appendChild($.getListItemDivider(date));
				prevDate = date;
			}

			for (var k = 0; k < checklist.length; k++) {
				var count = checklist[k].howMany || 'X'; //ternary operator.
				var species = '<a href="#species" class="gotoSpecies" title="'+ checklist[k].comName + ' (' + checklist[k].sciName + ')' + '" target="_self">' + checklist[k].comName + '</a>';
    			var timeOut = '<a href="https://ebird.org/ebird/view/checklist?subID=' + checklist[k].subID + '" target="_blank">' + time + '</a>';
	            var userName = checklist[k].userDisplayName;

				var innerHtml = count + " " + species + " @ " + timeOut + "<br>-- " + userName;
				ul.appendChild($.getListItem(innerHtml));
				speciesCount++;
			}
		}
		ul.appendChild($.getListItem("&nbsp;"));
		/* Set message */
		var message = speciesCount + ' species at <a href="http://ebird.org/ebird/hotspot/' + locId  + '" target="_blank" class="external">' + checklist[0].locName + '</a> in last 10 days.';
		ul.insertBefore($.getListItemDivider(message), ul.childNodes[0]);
		return ul;
	}
});

jQuery.extend({
	getSpeciesHtml: function(data, regName) {
		var ul = $.getUnorderedList();
		var extractedDatetimes = $.extractDatetimesFromResultsData(data);
		/* Set date for dividing list item and use the date collection to extract summary of checklist data for display */
		var prevDate = "";
		for (var j = 0; j < extractedDatetimes.length; ++j) {
			var checklist = data.filter(function(i, n) { return i.obsDt == extractedDatetimes[j]; });
			var date = $.formatDateTime('dd-MM', new Date(extractedDatetimes[j].replace(/-/g , "/")));
			var time = $.formatDateTime('hh:ii', new Date(extractedDatetimes[j].replace(/-/g , "/")));
			var count = checklist[0].howMany || 'X'; //ternary operator.
			var location = '<a href="#location" class="gotoLocation" title="' + checklist[0].locID + '" target="_self">' + checklist[0].locName + '</a>';

			if (prevDate != date) {
				//write out date heading.
				ul.appendChild($.getListItemDivider(date));
				prevDate = date;
			}

			var innerHtml = count + " @ " + location + " @ " + time;
			ul.appendChild($.getListItem(innerHtml));
		}
		ul.appendChild($.getListItem("&nbsp;"));		
		/* Set message */
		var message = extractedDatetimes.length + ' sightings of <a href="https://duckduckgo.com/?q=' + checklist[0].comName + '&iax=1&ia=images" target="_blank" class="external">' + checklist[0].comName + '</a> in ' + regName + ' in last 10 days.';
		ul.insertBefore($.getListItemDivider(message), ul.childNodes[0]);
		return ul;
	}
});
