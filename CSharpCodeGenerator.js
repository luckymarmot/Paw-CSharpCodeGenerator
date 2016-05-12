loadScript('./nunjucks.js');

nunjucks.configure({ autoescape: false });

var env = new nunjucks.Environment(null,{ autoescape: false });

env.addFilter('e', function(str) {
   return str.replace(/[\\"]/g, '\\$&').replace(/\n/g, "\\n");
});


var header_mappings = {
	"accept": "Accept",
	"connection": "Connection",
	"content-length": "ContentLength",
	"content-type": "ContentType",
	"expect": "Expect",
	"date": "Date",
	"host": "Host",
	"if-modified-since": "IfModifiedSince",
	"range": "Range",
	"referer": "Referer",
	"transfer-encoding": "TransferEncoding",
	"user-agent": "UserAgent",
}

var CSharpCodeGenerator = function() {

	this.generate = function(context, requests, options) {
		
		var client_code = "";

		var template = readFile("CS.njk");
		var frame = readFile("CSFrame.njk");

		var rendered_requests = [];

		for (var i in requests) {
			var request = requests[i];

			var headers = request.headers;

			var view = {
				"request": request,
				"custom_headers" : {},
				"headers": {},
				"compute_length": true
			}
 			
 			view.name = request.name.replace(/[^a-zA-Z0-9]/g, "");

			for (var header_name in headers) {
				if(header_name.toLowerCase() in header_mappings) {
					view.headers[header_mappings[header_name.toLowerCase()]] = headers[header_name];
				} else {
					view.custom_headers[header_name] = headers[header_name];
				}
			}

			if ("ContentLength" in view.headers) {
				view.compute_length = false;
			}
			
			if (typeof request.body !== "undefined" && request.body !== null) {
					view.text_body = request.body;
			} else if (request.getBody(true).length === 1 && request.getBody(true).getComponentAtIndex(0).type === "com.luckymarmot.FileContentDynamicValue") {
					view.file = true;
			}

			rendered_requests.push (env.renderString(template, view));
		}



		return env.renderString(frame, {requests: rendered_requests});

	
	}
		

}

CSharpCodeGenerator.identifier = "com.luckymarmot.PawExtensions.CSharpCodeGenerator";

CSharpCodeGenerator.title = "C#";

CSharpCodeGenerator.languageHighlighter = "cs";

CSharpCodeGenerator.fileExtension = "cs";

registerCodeGenerator(CSharpCodeGenerator);
