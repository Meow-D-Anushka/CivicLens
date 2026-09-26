// Vercel serverless entry point.
// Vercel imports this file and calls the default export as a request
// handler for every request — it does NOT run `server.js`'s app.listen().
// Keep this file thin: all real app logic lives in src/app.js so the
// same Express app can also be run standalone (see ../server.js) on a
// persistent host like Render/Railway.
import app from '../src/app.js';

export default app;
