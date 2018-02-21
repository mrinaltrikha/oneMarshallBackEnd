const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const querystring = require('querystring');
const request = require('request');

var database_url = 'mongodb://localhost:27017/digital_loyalty_program';
if (process.argv.length > 2 && process.argv[2] === "production") {
    console.log('Using AWS Settings for MongoDB Connection')
    database_url = 'mongodb://dlpuser:demo123@localhost:27017/digital_loyalty_program';
}

// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

// // Get users
// router.get('/users', (req, res) => {
//     connection((db) => {
//         db.collection('users')
//             .find()
//             .toArray()
//             .then((users) => {
//                 response.data = users;
//                 res.json(response);
//             })
//             .catch((err) => {
//                 sendError(err, res);
//             });
//     });
// });

//==============================================================
// RESTful WEB SERVICES - LinkedIn
//==============================================================

// OAuth 2.0 - Authorized Redirect URL
router.get('/linkedin/OAuthTwo/AuthorizedRedirectURL', function (req, res) {
    console.log('Executing Web Service: LinkedIn - OAuth 2.0 - Authorized Redirect URL');

    console.log(req.query);

    var code = req.query.code;
    var state = req.query.state;

    console.log('- Received Code : ' + code);
    console.log('- Received State: ' + state);

    var form = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://ec2-13-57-24-156.us-west-1.compute.amazonaws.com:8080/api/linkedin/OAuthTwo/AuthorizedRedirectURL',
        client_id: '863e3dqdym6itx',
        client_secret: '1boWyHKM2sUplhiS'
    };
    
    var formData = querystring.stringify(form);
    var contentLength = formData.length;
    
    request({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: 'https://www.linkedin.com/oauth/v2/accessToken',
        body: formData,
        method: 'POST'
    }, function (err,httpResponse,body) {
        console.log(body);
        var bodyJson = JSON.parse(body);

        MongoClient.connect(database_url, function (err, db) {
            assert.equal(null, err);

            var accessToken = bodyJson['access_token'];
            var accessTokenExpiresIn = bodyJson['expires_in'];
            
            console.log('- Received Access Token : ' + accessToken);
            console.log('- Received Expires In   : ' + accessTokenExpiresIn);

            var updateFields = {
                "accessToken": accessToken,
                "accessTokenExpiresInSec": accessTokenExpiresIn,
            };
            db.collection('students').updateOne({ "_id": ObjectId(state) }, { $set: updateFields });
            
            console.log('- Updated Record with Access Token: ' + JSON.stringify(updateFields));

            request({
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                },
                uri: 'https://api.linkedin.com/v1/people/~?format=json',
                method: 'GET'
            }, function (err,httpResponse,body) {
                console.log(body);
                var bodyJson = JSON.parse(body);

                var linkedInId = bodyJson['id'];
                var linkedInHeadline = bodyJson['headline'];
                var linkedInProfileUrl= bodyJson['siteStandardProfileRequest']['url'];
                
                console.log('- Received LinkedIn ID         : ' + linkedInId);
                console.log('- Received LinkedIn Headline   : ' + linkedInHeadline);
                console.log('- Received LinkedIn Profile Url: ' + linkedInProfileUrl);

                var updateFields = {
                    "linkedInId": linkedInId,
                    "linkedInHeadline": linkedInHeadline,
                    "linkedInProfileUrl": linkedInProfileUrl
                };
                db.collection('students').updateOne({ "_id": ObjectId(state) }, { $set: updateFields });
                
                console.log('- Updated Record with LinkedIn Profile: ' + JSON.stringify(updateFields));

                request({
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    uri: 'https://api.linkedin.com/v1/people/' + linkedInId + '/picture-url?format=json',
                    method: 'GET'
                }, function (err,httpResponse,body) {
                    console.log(body);

                    var linkedInPictureUrl = body.replace(/\"/g, '');
    
                    console.log('- Received LinkedIn Profile Picture Url: ' + linkedInPictureUrl);

                    var updateFields = {
                        "linkedInPictureUrl": linkedInPictureUrl
                    };
                    db.collection('students').updateOne({ "_id": ObjectId(state) }, { $set: updateFields });
                    
                    console.log('- Updated Record with LinkedIn Profile Picture Url: ' + JSON.stringify(updateFields));
    
                    request({
                        headers: {
                            'Authorization': 'Bearer ' + accessToken
                        },
                        uri: 'https://api.linkedin.com/v1/people/~/picture-urls::(original)?format=json',
                        method: 'GET'
                    }, function (err,httpResponse,body) {
                        console.log(body);
                        var bodyJson = JSON.parse(body);

                        var linkedInOriginalPictureUrl = bodyJson['values'][0];
    
                        console.log('- Received LinkedIn Original Profile Picture Url: ' + linkedInOriginalPictureUrl);
    
                        var updateFields = {
                            "linkedInOriginalPictureUrl": linkedInOriginalPictureUrl
                        };
                        db.collection('students').updateOne({ "_id": ObjectId(state) }, { $set: updateFields });
                        
                        console.log('- Updated Record with LinkedIn Original Profile Picture Url: ' + JSON.stringify(updateFields));
        
                        res.setHeader('Content-Type', 'application/json');
                        res.json({});
                    });
                });
            });
        });
    });
});

//==============================================================
// RESTful WEB SERVICES - STUDENTS
//==============================================================

// CREATE
router.post('/student', function (req, res) {
    console.log('Executing Web Service: Create Student');

    var record = {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "uscEmail": req.body.uscEmail,
        "password": req.body.password,
        "programme": req.body.programme,
        "core": req.body.core,
        "classOf": req.body.classOf,
        "linkedIn": req.body.linkedIn,
        "interests": req.body.interests,
        "accessToken": req.body.accessToken,
        "accessTokenExpiresInSec": req.body.accessTokenExpiresInSec,
        "linkedInId": req.body.linkedInId,
        "linkedInProfileUrl": req.body.linkedInProfileUrl,
        "linkedInHeadline": req.body.linkedInHeadline,
        "linkedInPictureUrl": req.body.linkedInPictureUrl,
        "linkedInOriginalPictureUrl": req.body.linkedInOriginalPictureUrl
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('students').insertOne(record, function (err, result) {
            assert.equal(err, null);
            console.log("- Added Record: " + record);
            res.send({});
        });
    });
});

// RETRIEVE
router.get('/student/:id', function (req, res) {
    console.log('Executing Web Service: Retrieve Student');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('students').findOne(ObjectId(req.params.id), function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

// RETRIEVE by uscEmail
router.get('/studentbyuscemail/:uscEmail', function (req, res) {
    console.log('Executing Web Service: Retrieve Student by uscEmail');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('students').findOne({"uscEmail": req.params.uscEmail}, function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

// UPDATE
router.put('/student/:id', function (req, res) {
    console.log('Executing Web Service: Update Student');

    var record = {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "uscEmail": req.body.uscEmail,
        "password": req.body.password,
        "programme": req.body.programme,
        "core": req.body.core,
        "classOf": req.body.classOf,
        "linkedIn": req.body.linkedIn,
        "interests": req.body.interests,
        "accessToken": req.body.accessToken,
        "accessTokenExpiresInSec": req.body.accessTokenExpiresInSec,
        "linkedInId": req.body.linkedInId,
        "linkedInProfileUrl": req.body.linkedInProfileUrl,
        "linkedInHeadline": req.body.linkedInHeadline,
        "linkedInPictureUrl": req.body.linkedInPictureUrl,
        "linkedInOriginalPictureUrl": req.body.linkedInOriginalPictureUrl
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('students').updateOne({ "_id": ObjectId(req.params.id) }, { $set: record });
        console.log('- Updated Record: ' + record);
        res.send('{}');
    });
});

// DELETE
router.delete('/student/:id', function (req, res) {
    console.log('Executing Web Service: Delete Student');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('students').deleteOne({ "_id": ObjectId(req.params.id) }, function () {
            console.log('- Deleted Student');
            res.send({});
        });
    });
});

// RETRIEVE ALL
router.get('/students', function (req, res) {
    console.log('Executing Web Service: Retrieve All Students');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('students').find({}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Students: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

//==============================================================
// RESTful WEB SERVICES - MARSHALL MATTERS
//==============================================================

// CREATE
router.post('/issue', function (req, res) {
    console.log('Executing Web Service: Create Issue');

    var record = {
        "title": req.body.title,
        "description": req.body.description,
        "upVotes": req.body.upVotes,
        "createdOn": req.body.createdOn
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('issues').insertOne(record, function (err, result) {
            assert.equal(err, null);
            console.log("- Added Record: " + record);
            res.send({});
        });
    });
});

// RETRIEVE
router.get('/issue/:id', function (req, res) {
    console.log('Executing Web Service: Retrieve Issue');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('issues').findOne(ObjectId(req.params.id), function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

// UPDATE
router.put('/issue/:id', function (req, res) {
    console.log('Executing Web Service: Update Issue');

    var record = {
        "title": req.body.title,
        "description": req.body.description,
        "upVotes": req.body.upVotes,
        "createdOn": req.body.createdOn
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('issues').updateOne({ "_id": ObjectId(req.params.id) }, { $set: record });
        console.log('- Updated Record: ' + record);
        res.send('{}');
    });
});

// DELETE
router.delete('/issue/:id', function (req, res) {
    console.log('Executing Web Service: Delete Issue');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('issues').deleteOne({ "_id": ObjectId(req.params.id) }, function () {
            console.log('- Deleted Issue');
            res.send({});
        });
    });
});

// RETRIEVE ALL
router.get('/issues', function (req, res) {
    console.log('Executing Web Service: Retrieve All Issues');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('issues').find({}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Issues: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

//==============================================================
// RESTful WEB SERVICES - MEMBERS
//==============================================================

// CREATE
router.post('/member', function (req, res) {
    console.log('Executing Web Service: Create Member');

    var record = {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "phone": req.body.phone,
        "email": req.body.email,
        "password": req.body.password,
        "dob": req.body.dob
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('members').insertOne(record, function (err, result) {
            assert.equal(err, null);
            console.log("- Added Record: " + record);
            res.send({});
        });
    });
});

// RETRIEVE
router.get('/member/:id', function (req, res) {
    console.log('Executing Web Service: Retrieve Member');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('members').findOne(ObjectId(req.params.id), function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

// UPDATE
router.put('/member/:id', function (req, res) {
    console.log('Executing Web Service: Update Member');

    var record = {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "phone": req.body.phone,
        "email": req.body.email,
        "password": req.body.password,
        "dob": req.body.dob
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('members').updateOne({ "_id": ObjectId(req.params.id) }, { $set: record });
        console.log('- Updated Record: ' + record);
        res.send('{}');
    });
});

// DELETE
router.delete('/member/:id', function (req, res) {
    console.log('Executing Web Service: Delete Member');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('members').deleteOne({ "_id": ObjectId(req.params.id) }, function () {
            console.log('- Deleted Record');
            res.send({});
        });
    });
});

// RETRIEVE ALL
router.get('/members', function (req, res) {
    console.log('Executing Web Service: Retrieve All Members');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('members').find({}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Records: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

// RETRIEVE - BY EMAIL
router.get('/memberByEmail/:email', function (req, res) {
    console.log('Executing Web Service: Retrieve Member By Email');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('members').findOne({"email": req.params.email}, function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

//==============================================================
// RESTful WEB SERVICES - PARTNERS
//==============================================================

// CREATE
router.post('/partner', function (req, res) {
    console.log('Executing Web Service: Create Partner');

    var record = {
        "businessName": req.body.businessName,
        "contactPersonFirstName": req.body.contactPersonFirstName,
        "contactPersonLastName": req.body.contactPersonLastName,
        "contactPersonPhone": req.body.contactPersonPhone,
        "contactPersonEmail": req.body.contactPersonEmail
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('partners').insertOne(record, function (err, result) {
            assert.equal(err, null);
            console.log("- Added Record: " + record);
            res.send({});
        });
    });
});

// RETRIEVE
router.get('/partner/:id', function (req, res) {
    console.log('Executing Web Service: Retrieve Partner');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('partners').findOne(ObjectId(req.params.id), function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

// UPDATE
router.put('/partner/:id', function (req, res) {
    console.log('Executing Web Service: Update Partner');

    var record = {
        "businessName": req.body.businessName,
        "contactPersonFirstName": req.body.contactPersonFirstName,
        "contactPersonLastName": req.body.contactPersonLastName,
        "contactPersonPhone": req.body.contactPersonPhone,
        "contactPersonEmail": req.body.contactPersonEmail
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('partners').updateOne({"_id": ObjectId(req.params.id)}, { $set: record });
        console.log('- Updated Record: ' + record);
        res.send('{}');
    });
});

// DELETE
router.delete('/partner/:id', function (req, res) {
    console.log('Executing Web Service: Delete Partner');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        console.log(req.params.id);
        db.collection('partners').deleteOne({"_id": ObjectId(req.params.id)}, function () {
            console.log('- Deleted Record');
            res.send({});
        });
    });
});

// RETRIEVE ALL
router.get('/partners', function (req, res) {
    console.log('Executing Web Service: Retrieve All Partners');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('partners').find({}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Records: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

//==============================================================
// RESTful WEB SERVICES - REDEMPTION ITEMS
//==============================================================

// CREATE
router.post('/redemptionItem', function (req, res) {
    console.log('Executing Web Service: Create Redemption Item');

    var record = {
        "name": req.body.name,
        "description": req.body.description,
        "costInPoints": req.body.costInPoints,
        "displayImage": {
            "filename": req.body.displayImage.filename,
            "filetype": req.body.displayImage.filetype,
            "value": req.body.displayImage.value
        }
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('redemptionItems').insertOne(record, function (err, result) {
            assert.equal(err, null);
            console.log("- Added Record: " + record);
            res.send({});
        });
    });
});

// RETRIEVE
router.get('/redemptionItem/:id', function (req, res) {
    console.log('Executing Web Service: Retrieve Redemption Item');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('redemptionItems').findOne(ObjectId(req.params.id), function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

// UPDATE
router.put('/redemptionItem/:id', function (req, res) {
    console.log('Executing Web Service: Update Redemption Item');

    var record = {
        "name": req.body.name,
        "description": req.body.description,
        "costInPoints": req.body.costInPoints,
        "displayImage": {
            "filename": req.body.displayImage.filename,
            "filetype": req.body.displayImage.filetype,
            "value": req.body.displayImage.value
        }
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('redemptionItems').updateOne({"_id": ObjectId(req.params.id)}, { $set: record });
        console.log('- Updated Record: ' + record);
        res.send('{}');
    });
});

// DELETE
router.delete('/redemptionItem/:id', function (req, res) {
    console.log('Executing Web Service: Delete Redemption Item');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        console.log(req.params.id);
        db.collection('redemptionItems').deleteOne({"_id": ObjectId(req.params.id)}, function () {
            console.log('- Deleted Record');
            res.send({});
        });
    });
});

// RETRIEVE ALL
router.get('/redemptionItems', function (req, res) {
    console.log('Executing Web Service: Retrieve All Redemption Items');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('redemptionItems').find({}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Records: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

//==============================================================
// RESTful WEB SERVICES - MEMBER REDEMPTION ORDERS
//==============================================================

// CREATE
router.post('/memberRedemptionOrder', function (req, res) {
    console.log('Executing Web Service: Create Member Redemption Order');

    var record = {
        "memberId": req.body.memberId,
        "redeemedOn": req.body.redeemedOn,
        "redeemedItems": req.body.redeemedItems
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('memberRedemptionOrders').insertOne(record, function (err, result) {
            assert.equal(err, null);
            console.log("- Added Record: " + record);
            res.send({});
        });
    });
});

// RETRIEVE ALL
router.get('/memberRedemptionOrders', function (req, res) {
    console.log('Executing Web Service: Retrieve All Member Redemption Orders');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('memberRedemptionOrders').find({}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Records: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

// RETRIEVE ALL
router.get('/memberRedemptionOrders/:memberId', function (req, res) {
    console.log('Executing Web Service: Retrieve All Member Redemption Orders by Member Id: ' + req.params.memberId);

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('memberRedemptionOrders').find({"memberId": req.params.memberId}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Records: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

//==============================================================
// RESTful WEB SERVICES - COUPONS
//==============================================================

// CREATE
router.post('/coupon', function (req, res) {
    console.log('Executing Web Service: Create Coupon');

    var record = {
        "couponName": req.body.couponName,
        "couponCode": req.body.couponCode,
        "couponPartner": req.body.couponPartner,
        "couponExpiryDate": req.body.couponExpiryDate
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('coupons').insertOne(record, function (err, result) {
            assert.equal(err, null);
            console.log("- Added Record: " + record);
            res.send({});
        });
    });
});

// RETRIEVE
router.get('/coupon/:id', function (req, res) {
    console.log('Executing Web Service: Retrieve Coupon');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('coupons').findOne(ObjectId(req.params.id), function (err, doc) {
            assert.equal(err, null);
            console.log("- Fetched Record: " + doc);

            res.setHeader('Content-Type', 'application/json');
            res.json(doc);
        });
    });
});

// UPDATE
router.put('/coupon/:id', function (req, res) {
    console.log('Executing Web Service: Update Coupon');

    var record = {
        "couponName": req.body.couponName,
        "couponCode": req.body.couponCode,
        "couponPartner": req.body.couponPartner,
        "couponExpiryDate": req.body.couponExpiryDate
    };

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('coupons').updateOne({"_id": ObjectId(req.params.id)}, { $set: record });
        console.log('- Updated Record: ' + record);
        res.send('{}');
    });
});

// DELETE
router.delete('/coupon/:id', function (req, res) {
    console.log('Executing Web Service: Delete Coupon');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        console.log(req.params.id);
        db.collection('coupons').deleteOne({"_id": ObjectId(req.params.id)}, function () {
            console.log('- Deleted Record');
            res.send({});
        });
    });
});

// RETRIEVE ALL
router.get('/coupons', function (req, res) {
    console.log('Executing Web Service: Retrieve All Coupons');

    MongoClient.connect(database_url, function (err, db) {
        assert.equal(null, err);
        db.collection('coupons').find({}).toArray(function (err, arrayOfDocs) {
            assert.equal(err, null);
            console.log("- All Retieved Records: " + arrayOfDocs);

            res.setHeader('Content-Type', 'application/json');
            res.json(arrayOfDocs);
        });
    });
});

module.exports = router;