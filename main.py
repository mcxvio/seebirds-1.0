import webapp2

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write('<a href="index.html" class="centerbox">Search</a>')

app = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
