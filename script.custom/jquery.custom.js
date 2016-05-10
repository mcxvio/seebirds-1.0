function getSubRegionFromSelection(selection) {
	//http://stackoverflow.com/questions/17779744/regular-expression-to-get-a-string-between-parentheses-in-javascript
	var regExp = /\(([^)]+)\)/;
	return selection.match(regExp)[1];
}

function getRegionTypeFromSubRegion(subregion) {
	var regex = /-/gi; // Get separating dashes.

	var regionType = "subnational1";
	if (subregion.length == 3) {
		regionType = "country";
		subregion = subregion.substring(0,2); //"US-" to "US".
	} else {
		if (subregion.match(regex).length == 2) { //contains 2 dashes.
			regionType = "subnational2";
		}
	}
	return regionType;
}

function removeTypeaheadBgColorStyle(elementId) {
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

// Setup URLs.
function getChecklistSubmissionUrl(region) {
	var subregion = getSubRegionFromSelection(region);
	var rtype = getRegionTypeFromSubRegion(subregion);
	return "//ebird.org/ws1.1/data/obs/region/recent?rtype=" + rtype + "&r=" + subregion + "&hotspot=true&includeProvisional=true&back=5&fmt=json";
}

function getNotableSightingsUrl(region) {
	var subregion = getSubRegionFromSelection(region);
	var rtype = getRegionTypeFromSubRegion(subregion);
	return "//ebird.org/ws1.1/data/notable/region/recent?rtype=" + rtype + "&r=" + subregion + "&detail=full&hotspot=true&back=5&fmt=json";	
}

function getLocationSubmissionsUrl(locationId) {
	return "//ebird.org/ws1.1/data/obs/hotspot/recent?r=" + locationId + "&detail=full&includeProvisional=true&back=10&fmt=json";
}

function getSpeciesSightingsUrl(region, scientificName) {
	var subregion = getSubRegionFromSelection(region);
	var rtype = getRegionTypeFromSubRegion(subregion);
	return "//ebird.org/ws1.1/data/obs/region_spp/recent?rtype=" + rtype + "&r=" + subregion + "&sci=" + scientificName + "&hotspot=true&includeProvisional=true&back=10&fmt=json";
}
// End URLs.

// Process data as HTML unordered list.
function getChecklistSubmissions(region, message) {
    if (region.length == 0) {
        return getSelectChecklistsNotablesMessage(message);
    }
	
	var url = getChecklistSubmissionUrl(region);
	var data = $.getValues(url, "json");
	var output = "";
	
    if (data.length > 0) {
        output = getChecklistsHtml(data, region);
    }

    return output;
}

function getNotableSightings(region, message) {
    if (region.length == 0) {
        return getSelectChecklistsNotablesMessage(message);
    }
	
	var url = getNotableSightingsUrl(region);
	var data = $.getValues(url, "json");
	var output = "";
	
    if (data.length > 0) {
        output = getNotablesHtml(data, region);
    }

    return output;
}

function getLocationSubmissions(locationId) {
	if (locationId == "") {
		return "";
	}
	
	var url = getLocationSubmissionsUrl(locationId);
	var data = $.getValues(url, "json");
	var output = "";
	
    if (data.length > 0) {
        output = getLocationHtml(data, locationId);
    }

	return output;
}

function getSpeciesSightings(region, scientificName) {
	if (scientificName == null) {
		return "";
	}
	
	var url = getSpeciesSightingsUrl(region, scientificName);
	var data = $.getValues(url, "json");
	var output = "";
	
    if (data.length > 0) {
        output = getSpeciesHtml(data, scientificName);
    }

	return output;
}

function extractDatetimesFromResultsData(data) {
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
// End Data.

// Create output lists.
function getUnorderedList() {
	var ul = document.createElement('ul');
	ul.setAttribute("data-role", "listview");
	ul.setAttribute("class", "ui-listview");
	return ul;
}

function getListItem(innerHtml) {
	var li = document.createElement('li');
	li.setAttribute("class", "ui-li-static ui-body-inherit");
	li.innerHTML = innerHtml;
	return li;
}

function getListItemDivider(innerHtml) {
	var lid = document.createElement('li');
	lid.setAttribute("data-role", "list-divider");
	lid.setAttribute("role", "heading");
	lid.setAttribute("class", "ui-li-divider ui-body-inherit");		
	lid.innerHTML = innerHtml;
	return lid;
}

function getSelectChecklistsNotablesMessage(message) {
	var ul = getUnorderedList();
	ul.appendChild(getListItemDivider(message));
	return ul;
}
// End lists.

// Format data into html lists.
function getChecklistsHtml(data, selection) {
	var ul = getUnorderedList();
	var extractedDatetimes = extractDatetimesFromResultsData(data);
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
			ul.appendChild(getListItemDivider(date));
			prevDate = date;
		}

		var innerHtml = count + " species @ " + location + " @ " + time;
		ul.appendChild(getListItem(innerHtml));
	}
	ul.appendChild(getListItem("&nbsp;"));
	/* Set message */
	var message = extractedDatetimes.length + " checklists with most recent species for " + selection + " in last 5 days.";
	ul.insertBefore(getListItemDivider(message), ul.childNodes[0]);
	return ul;
}

function getNotablesHtml(data, selection) {
	var ul = getUnorderedList();
	var extractedDatetimes = extractDatetimesFromResultsData(data);
	/* Set date for dividing list item and use the date collection to extract summary of checklist data for display */
	var prevDate = "";
	var speciesCount = 0;
	for (var j = 0; j < extractedDatetimes.length; ++j) {
		var checklist = data.filter(function(i, n) { return i.obsDt == extractedDatetimes[j]; });

		var date = $.formatDateTime('dd-MM', new Date(extractedDatetimes[j].replace(/-/g , "/")));
		var time = $.formatDateTime('hh:ii', new Date(extractedDatetimes[j].replace(/-/g , "/")));

		if (prevDate != date) {
			//write out date heading.
			ul.appendChild(getListItemDivider(date));
			prevDate = date;
		}

		for (var k = 0; k < checklist.length; k++) {
			var count = checklist[k].howMany || 'X'; //ternary operator.
			var species = '<a href="#species" class="gotoSpecies" title="'+ checklist[k].comName + ' (' + checklist[k].sciName + ')' + '" target="_self">' + checklist[k].comName + '</a>';
            var location = '<a href="#location" class="gotoLocation" title="' + checklist[k].locID + '" target="_self">' + checklist[k].locName + '</a>';
			var timeOut = '<a href="https://ebird.org/ebird/view/checklist?subID=' + checklist[k].subID + '" target="_blank">' + time + '</a>';
			var userName = checklist[k].userDisplayName;

			var innerHtml = count + " " + species + " @ " + location + " @ " + timeOut + "<br> -- " + userName;
			ul.appendChild(getListItem(innerHtml));
			speciesCount++;
		}
	}
	ul.appendChild(getListItem("&nbsp;"));		
	/* Set message */
	var message = speciesCount + " notable sightings for " + selection + " in last 5 days.";
	ul.insertBefore(getListItemDivider(message), ul.childNodes[0]);
	return ul;
}

function getLocationHtml(data, locId) {
	var ul = getUnorderedList();
	var extractedDatetimes = extractDatetimesFromResultsData(data);
	/* Set date for dividing list item and use the date collection to extract summary of checklist data for display */
	var prevDate = "";
	var speciesCount = 0;
	for (var j = 0; j < extractedDatetimes.length; ++j) {
		var checklist = data.filter(function(i, n) { return i.obsDt == extractedDatetimes[j]; });

		var date = $.formatDateTime('dd-MM', new Date(extractedDatetimes[j].replace(/-/g , "/")));
		var time = $.formatDateTime('hh:ii', new Date(extractedDatetimes[j].replace(/-/g , "/")));

		if (prevDate != date) {
			//write out date heading.
			ul.appendChild(getListItemDivider(date));
			prevDate = date;
		}

		for (var k = 0; k < checklist.length; k++) {
			var count = checklist[k].howMany || 'X'; //ternary operator.
			var species = '<a href="#species" class="gotoSpecies" title="'+ checklist[k].comName + ' (' + checklist[k].sciName + ')' + '" target="_self">' + checklist[k].comName + '</a>';
			var timeOut = '<a href="https://ebird.org/ebird/view/checklist?subID=' + checklist[k].subID + '" target="_blank">' + time + '</a>';
            var userName = checklist[k].userDisplayName;

			var innerHtml = count + " " + species + " @ " + timeOut + "<br>-- " + userName;
			ul.appendChild(getListItem(innerHtml));
			speciesCount++;
		}
	}
	ul.appendChild(getListItem("&nbsp;"));
	/* Set message */
	var message = speciesCount + ' species at <a href="http://ebird.org/ebird/hotspot/' + locId  + '" target="_blank" class="external">' + checklist[0].locName + '</a> in last 10 days.';
	ul.insertBefore(getListItemDivider(message), ul.childNodes[0]);
	return ul;
}

function getSpeciesHtml(data, regName) {
	var ul = getUnorderedList();
	var extractedDatetimes = extractDatetimesFromResultsData(data);
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
			ul.appendChild(getListItemDivider(date));
			prevDate = date;
		}

		var innerHtml = count + " @ " + location + " @ " + time;
		ul.appendChild(getListItem(innerHtml));
	}
	ul.appendChild(getListItem("&nbsp;"));		
	/* Set message */
	var message = extractedDatetimes.length + ' sightings of <a href="https://duckduckgo.com/?q=' + checklist[0].comName + '&iax=1&ia=images" target="_blank" class="external">' + checklist[0].comName + '</a> in ' + regName + ' in last 10 days.';
	ul.insertBefore(getListItemDivider(message), ul.childNodes[0]);
	return ul;
}
// End formatting.