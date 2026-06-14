const express = require('express');
const installAdminPreviewMock = require('./adminPreview');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:1617');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authori-zation, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

installAdminPreviewMock(app);

const port = Number(process.env.MVP_MOCK_PORT || 1618);
app.listen(port, '127.0.0.1', () => {
  console.log(`CRMEB MVP preview API: http://127.0.0.1:${port}/adminapi`);
});
