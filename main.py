import webapp2

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write('<html><head></head><body><div style="text-align: center; padding-left: 50px; padding-top: 50px; font-size: 1.75em;"><p>Welcome to Seebirds:</p><a href="index.html">Search</a></div></body></html>')

app = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
