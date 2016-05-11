describe("Get subregion between brackets", function() {
  it("returns a region code", function() {
    
    var region = "Suffolk (US-MA-025)";
    var result = "US-MA-025";
    
    expect(getSubRegionFromSelection(region)).toEqual(result);
  });
});

describe("Get region type from subregion", function() {
    it("returns country", function() {
        var regionCountry = "US-";
        expect(getRegionTypeFromSubRegion(regionCountry)).toEqual("country");
    });
    
    it("returns state", function() {
        var regionState = "US-MA";
        expect(getRegionTypeFromSubRegion(regionState)).toEqual("subnational1");
    });
    
    it("returns county", function() {
        var regionCounty = "US-MA-025";
        expect(getRegionTypeFromSubRegion(regionCounty)).toEqual("subnational2");
   });
});

describe("Get an unordered list and its items", function() {
  var val;  
  beforeAll(function() {
    val = "message";
  });
  
  it("returns <ul>", function() {
    var html = getUnorderedList().outerHTML;

    expect(html).toEqual(jasmine.stringMatching('ul'));
    expect(html).toEqual(jasmine.stringMatching('data-role="listview"'));
    expect(html).toEqual(jasmine.stringMatching('class="ui-listview'));
    expect(html).toEqual(jasmine.stringMatching('/ul'));
  });

  it("returns <li> with passed text as item", function() {
    var html = getListItem(val).outerHTML;

    expect(html).toEqual(jasmine.stringMatching('li'));
    expect(html).toEqual(jasmine.stringMatching('class="ui-li-static ui-body-inherit"'));
    expect(html).toEqual(jasmine.stringMatching(val));
    expect(html).toEqual(jasmine.stringMatching('/li'));
  });

  it("returns <li> with passed text as item styled to act as a header", function() {
    var html = getListItemDivider(val).outerHTML;

    expect(html).toEqual(jasmine.stringMatching('li'));
	  expect(html).toEqual(jasmine.stringMatching('data-role="list-divider"'));
	  expect(html).toEqual(jasmine.stringMatching('role="heading"'));
    expect(html).toEqual(jasmine.stringMatching('class="ui-li-divider ui-body-inherit"'));
    expect(html).toEqual(jasmine.stringMatching(val));
    expect(html).toEqual(jasmine.stringMatching('/li'));
  });

  it("returns <ul><li> with passed text as item's styled header message", function() {
    var html = formatResponseMessage(val).outerHTML;

    expect(html).toEqual(jasmine.stringMatching('ul'));
    expect(html).toEqual(jasmine.stringMatching('li'));
    expect(html).toEqual(jasmine.stringMatching(val));
    expect(html).toEqual(jasmine.stringMatching('/li'));
    expect(html).toEqual(jasmine.stringMatching('/ul'));
  });
});

describe("Get api urls", function() {
   it("returns url to retrieve checklist submission data", function() {

        var region = "United States (US-)";
        var url = getChecklistSubmissionUrl(region);
        //ebird.org/ws1.1/data/obs/region/recent?rtype=subnational2&r=US-MA-025&hotspot=true&includeProvisional=true&back=5&fmt=json

        expect(url).toEqual(jasmine.stringMatching('ebird.org/ws1.1/data/obs/region/recent'));
        expect(url).toEqual(jasmine.stringMatching('rtype=country'));
        expect(url).toEqual(jasmine.stringMatching('r=US'));
        expect(url).toEqual(jasmine.stringMatching('hotspot=true&includeProvisional=true&back=5&fmt=json'));
   });
   
   it("returns url to retrieve notable sightings data", function() {

        var region = "Massachusetts (US-MA)";
        var url = getNotableSightingsUrl(region);
        //ebird.org/ws1.1/data/notable/region/recent?rtype=subnational1&r=US-MA&detail=full&hotspot=true&back=5&fmt=json

        expect(url).toEqual(jasmine.stringMatching('ebird.org/ws1.1/data/notable/region/recent'));
        expect(url).toEqual(jasmine.stringMatching('rtype=subnational1'));
        expect(url).toEqual(jasmine.stringMatching('r=US-MA'));
        expect(url).toEqual(jasmine.stringMatching('detail=full&hotspot=true&back=5&fmt=json'));
   });

   it("returns url to retrieve location submission data", function() {

        var locationId = "L248222";
        var url = getLocationSubmissionsUrl(locationId);
        //ebird.org/ws1.1/data/obs/hotspot/recent?r=L248222&detail=full&includeProvisional=true&back=10&fmt=json

        expect(url).toEqual(jasmine.stringMatching('ebird.org/ws1.1/data/obs/hotspot/recent'));
        expect(url).toEqual(jasmine.stringMatching('r=' + locationId));
        expect(url).toEqual(jasmine.stringMatching('detail=full&includeProvisional=true&back=10&fmt=json'));
   });
   
   it("returns url to retrieve species sightings data", function() {

        var region = "Suffolk (US-MA-025)";
        var scientificName = "Hirundo rustica";
        var url = getSpeciesSightingsUrl(region, scientificName);
        //ebird.org/ws1.1/data/obs/region_spp/recent?rtype=subnational2&r=US-MA-025&sci=Hirundo rustica&hotspot=true&includeProvisional=true&back=10&fmt=json

        expect(url).toEqual(jasmine.stringMatching('ebird.org/ws1.1/data/obs/region_spp/recent'));
        expect(url).toEqual(jasmine.stringMatching('rtype=subnational2'));
        expect(url).toEqual(jasmine.stringMatching('r=US-MA-025'));
        expect(url).toEqual(jasmine.stringMatching('hotspot=true&includeProvisional=true&back=10&fmt=json'));
   });   
});

describe("Get data html output", function() {
   it("returns correctly formatted checklist submission data", function() {
        var region = "Suffolk (US-MA-025)";
        var html = getChecklistSubmissions(region, "Search again").outputHtml;
        expect(html).not.toBe("");
   });
   
   it("returns correctly formatted notable sightings data", function() {
        var region = "Suffolk (US-MA-025)";
        var html = getNotableSightings(region, "Search again").outputHtml;
        expect(html).not.toBe("");
   });
   
   it("returns correctly formatted location data", function() {
        var locationId = "L248222";
        var html = getLocationSubmissions(locationId).outputHtml;
        expect(html).not.toBe("");
   });
   
   it("returns correctly formatted species data", function() {
        var region = "Massachusetts (US-MA)";
        var scientificName = "Hirundo rustica";
        var html = getSpeciesSightings(region, scientificName);
        expect(html).not.toBe("");
   });
});

describe("Get error message from json", function() {
    var html = "";
    var region = "Massachusetts (US-MA)";
    var badregion = "Somesuch (XX-XX)";
    var scientificName = "Hrundo rustica";
    var locationId = "LXXXXXX";//"L248222";
  beforeAll(function() {
    console.log(html);
  });    

    it("returns correctly formatted species data" + html, function() {
        html = getChecklistSubmissions(badregion);
        expect(html).toBe("");
    });

    it("returns nothing for a bad region" + html, function() {
        html = getNotableSightings(badregion, "message");
        expect(html).toBe("");
    });

    it("returns nothing for bad location data" + html, function() {
        html = getLocationSubmissions(locationId);
        expect(html).toBe("");
    });
    
    it("returns correctly formatted no species data found message" + html, function() {
        html = getSpeciesSightings(region, scientificName);
        expect(html).not.toBe("");
    });
});
