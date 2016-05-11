$(document).on("pagecreate", "div[data-role=page]", function(event, ui) {
    
    var page = $(this).attr("id");
    if (page == 'checklists' || page == 'notables') {
        
        var items = new Bloodhound({
            datumTokenizer: function (datum) {
                return Bloodhound.tokenizers.whitespace(datum.value);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: {
                url: "data/subnationals2.json",
                filter: function (data) {
                    return $.map(data.response.regions, function (region) {
                        var subnational = region.subnational2_code || region.subnational1_code;
                        
                        return {
                            value: region.name + " (" + subnational + ")"
                            /*,code: region.country_code,sub1: region.subnational1_code,sub2: region.subnational2_code*/
                        };
                    });
                }
            }
        });
    	    
        // initialize the bloodhound suggestion engine
        items.initialize();
        //console.log("initialised :: ", page);

        // set the results pages
        var typeaheadui = '#notables #prefetch-notables .typeahead';
        var gotoPage = '#sightings';
        
        if (page == 'checklists') {
            typeaheadui = '#checklists #prefetch-checklists .typeahead';
            gotoPage = '#submissions';
        }

        // instantiate the typeahead UI
        $(typeaheadui).typeahead(
          {
              hint: true,
              highlight: true,
              minLength: 1
          },
          {
              name: 'engine',
              displayKey: 'value',
              source: items.ttAdapter(),
              templates: {
                  empty: [
    				"<li class='empty-message ui-btn'>Unable to find any matching results.</li>"
                  ].join('\n'),
                  suggestion: function(data) {
                    return "<li><a href='"+gotoPage+"' class='gotoRegion ui-btn ui-btn-icon-right ui-icon-carat-r'>" + data.value + "</a></li>";
    			  }
              }
    	  }
    	)
    	.on('typeahead:asyncrequest', function() {
    		console.log("typeahead:asyncrequest");
    		$('.Typeahead-spinner').show();
    	})
    	.on('typeahead:asynccancel typeahead:asyncreceive', function() {
    		console.log("typeahead:asynccancel");
    		$('.Typeahead-spinner').hide();
    	})
    	.on('typeahead:selected', function(evt, item) {
            // do what you want with the item here
            console.log("item: ", item.value);
        });
    }
});
