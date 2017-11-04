# SockPipe Authentication

This demo shows how to implement a simple token-based authentication.

Be aware that this exemple isn't safe for production applications, as it
uses unsafe `ws://` protocol to send user data and doesn't uses encryptation
either. It's intended only to ilustrate the solution. Always use `wss://`
protocol to send sensible data and always encrypt user's passwords when
developing real world applications.

To run the demo, follow the steps:

1. Install dependencies

`npm i`

3. Run server

`node server/server.js`

4. Open client on `http://localhost:8080`

5. Login using `test` as username and password to see a success message. Reload
the page to see you are still logged. Try any other credentials to receive an
error message from the server.
