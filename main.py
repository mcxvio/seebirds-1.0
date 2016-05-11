#http://stackoverflow.com/questions/7646657/writing-response-body-with-basehttprequesthandler
import SimpleHTTPServer
import BaseHTTPServer

PORT = 8000

class Handler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        print(self.wfile)
        self.wfile.write("<html><head><title>Title goes here.</title></head>")
        self.wfile.write("<body>")
        # If someone went to "http://something.somewhere.net/foo/bar/",
        # then s.path equals "/foo/bar/".
        #self.wfile.write("<p>You accessed path: %s</p>" % self.path)
        self.wfile.write("<a href='index.html'>Search</a>")
        self.wfile.write("</body></html>")
        self.wfile.close()

try:
    server = BaseHTTPServer.HTTPServer(('', PORT), Handler)
    print('Started http server')
    server.serve_forever()
except KeyboardInterrupt:
    print('^C received, shutting down server')
    server.socket.close()

'''
import webapp2

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write('<a href="index.html">Search</a>')

app = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
'''