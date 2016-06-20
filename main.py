# +++++++++++ SEEBIRDS +++++++++++
# WSGI to prove everything works.

SEEBIRDS_WELCOME = """<html>
<head></head>
<body>
    <div style="text-align: center; padding-left: 50px; padding-top: 50px; font-size: 1.75em;">
        <p>Welcome to Seebirds:</p><a href="index.html">Search</a>
    </div>
</body>
</html>
"""

def application(environ, start_response):
    if environ.get('PATH_INFO') == '/':
        status = '200 OK'
        content = SEEBIRDS_WELCOME
    else:
        status = '404 NOT FOUND'
        content = 'Page not found.'
    response_headers = [('Content-Type', 'text/html'), ('Content-Length', str(len(content)))]
    start_response(status, response_headers)
    yield content.encode('utf8')
