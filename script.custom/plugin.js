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
