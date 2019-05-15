const express = require('express');//This is the main server that is running up the whole system.
const app = express();
const Blockchain = require('./dev/Blockchain');//This is the method written for the blockchain.
const rp = require('request-promise');
const createError = require('http-errors');
const path = require('path');
const bodyParser = require('body-parser');
const log = require('morgan');
const cookie = require('cookie-parser');
//above are the modules for this system in the backend.
//some above modules are optionals.


app.set('view engine', 'ejs');
//This is important.It connects all the ejs webpages.

app.get('/', function(req, res) {
    res.render('main/homepage');
});//This is rendering the main webpages.all ejs webpages are showed here.


app.use(express.static(path.join(__dirname, 'resource')));//This is setting up the directory for user script files.
app.use(log('dev'));
app.use(cookie());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const bc = new Blockchain();//This is assigning the blockchain to a variable.


app.get('/blockchain', function(req, res)
{
    res.send(bc);
});//This method is to send the whole blockchain.


app.get('/block', function(req, res){
    res.send(bc.chain);
});//This method is to send only blockchain data.

app.post('/newChain', function(req, res){
    const newchain = req.body;
     bc.chain = [];
     bc.chain = newchain;
});

app.post('/createNewBlock/:Name,:Gender,:DateOfBirth,:Ssn,:Charge,:OffenseDate,:caseNo,:DisposedDate', function(req, res){
    const name = req.params.Name;
    const gender  = req.params.Gender;
    const date = req.params.DateOfBirth;
    const ssn = req.params.Ssn;
    const charge = req.params.Charge;
    const caseNo = req.params.caseNo;
    const offdate = req.params.OffenseDate;
    const disDate = req.params.DisposedDate;
    const lastBlock = bc.getLastBlock();
    const curBlockData = {
        Index : lastBlock['Index'] + 1,
        Name : name,
        Gender : gender,
        DateOfBirth : date,
        SSN : ssn,
        Charge : charge,
        CaseNo : caseNo,
        OffenseDate : offdate,
        DisposedDate : disDate
    };
    const previousBlockHash = lastBlock['CurrentBlockHash'];
    const nonce = bc.proofOfWork(previousBlockHash, curBlockData);
    const CurrentBlockhash = bc.hashBlock(previousBlockHash, curBlockData, nonce);
    const newBlock = bc.createNewBlock(nonce, name, gender, date, ssn, charge, caseNo, offdate, disDate, previousBlockHash, CurrentBlockhash);

    const requestPromises = [];
    bc.AllNetworkNodes.forEach(networkNodeUrl => {
        const requestoption = {
            uri : networkNodeUrl + '/receive-new-block',
            method : 'POST',
            body : { newBlock: newBlock },
            json : true
        };
        requestPromises.push(rp(requestoption));
    });

});//This method is to create the block.


app.post('/receive-new-block', function(req, res){
    const newBlock = req.body.newBlock;
    const lastBlock= bc.getLastBlock();
    const correctHash = lastBlock.CurrentBlockHash === newBlock.PreviousBlockHash;
    const correctIndex = lastBlock['Index'] + 1 === newBlock['Index'];
    if ( correctHash && correctIndex) {
        bc.chain.push(newBlock);
        res.json({
            Note : "New block accepted",
            NewBlock : newBlock
        });
    } else {
        res.json({
            Note : "New block rejected.",
            NewBlock : newBlock
        });
    }
});//This method is to broadcast new block to all the networks.


app.post('/broadcast',function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if(bc.AllNetworkNodes.indexOf(newNodeUrl) == -1) bc.AllNetworkNodes.push(newNodeUrl);
    
    const registerNode = [];
    bc.AllNetworkNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri : networkNodeUrl + '/register', 
            method : 'POST',
            body : { newNodeUrl : newNodeUrl},
            json : true
        };

       registerNode.push(rp(requestOption));
    
    });

    Promise.all(registerNode)
    .then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/bulk',
            method : 'POST',
            body : { allNetworkNodes : [ ...bc.AllNetworkNodes, bc.CurrentNetworkNode]},
            json : true
        };

    return rp(bulkRegisterOptions);
    })
    .then(data => {
		res.json({ note: 'New node registered with network successfully.' });
	})
});//This method is to broadcast the network addresses.


app.post('/register', function(req, res){
    const newNode = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bc.AllNetworkNodes.indexOf(newNode) == -1;
    const notCurrentNode = bc.CurrentNetworkNode !== newNode;
    if(nodeNotAlreadyPresent && notCurrentNode) bc.AllNetworkNodes.push(newNode);
    res.json({ note: 'New node registered successfully.'});
});//This method is to register network address of new device.

app.post('/bulk', function(req, res){
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bc.AllNetworkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bc.CurrentNetworkNode !== networkNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNode) bc.AllNetworkNodes.push(networkNodeUrl);
    });
    res.json({ note: 'Bulk registration successful.'});
});//This method is to add multiple network addresses of new devices.


app.get('/consensus', function(req, res) {
    const requestPromises = [];
    bc.AllNetworkNodes.forEach(networkNodeUrl => {
        const requestoption = {
            uri : networkNodeUrl + '/blockchain',
            method : 'GET',
            json : true
        };

        requestPromises.push(rp(requestoption));
    });
    Promise.all(requestPromises).then(blockchains => {
        const currentChainLength = bc.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;

        blockchains.forEach(blockchain => {
            if (blockchain.chain.length > maxChainLength){
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;            
            }
        });

        if (!newLongestChain || (newLongestChain && !bc.isChainValid(newLongestChain))) {
            res.render('partial/deny');
        }
        else if (newLongestChain && bc.isChainValid(newLongestChain)){
            bc.chain = newLongestChain;
            res.render('partial/grant');
        }
    });

});//This method is to check the validation of the block chain.


app.use(function(req, res, next) {
    next(createError(404));
  });// catch 404 and forward to error handler
  

app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });// error handler

module.exports = app;
