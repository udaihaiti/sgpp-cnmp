const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const institution = require('./src/routes/institutionRoutes');
const document = require('./src/routes/documentRoutes');
const comment = require('./src/routes/commentRoutes');
const login = require('./src/routes/loginRoute');
const fiscalYears = require('./src/routes/fiscalYearsRoutes');
const plansPrevisionnels = require('./src/routes/plansPrevisionnelsRoutes');

const app = express();
const port = process.env.PORT || 3001;

//-------middleware-------------------
app
    .use(bodyParser.json())
    .use(cors())

//-------------Endpoints--------------

app.use('/api/institution', institution)
app.use('/api/document', document)
app.use('/api/comment', comment)
app.use('/api/fiscal-years', fiscalYears)
app.use('/api/login', login)
app.use('/api/plans-previsionnels', plansPrevisionnels)

app.use(({ res }) => {
    const message = 'Impossible de trouver l\'URL demander.'
    res.status(404).json(message);
})

//run server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
