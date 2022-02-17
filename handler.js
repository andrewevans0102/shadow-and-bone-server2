const AWS = require('aws-sdk');
const express = require('express');
const serverless = require('serverless-http');

const app = express();

const VALUES_TABLE = process.env.VALUES_TABLE;

const dynamoDbClientParams = {};
if (process.env.IS_OFFLINE) {
    dynamoDbClientParams.region = 'localhost';
    dynamoDbClientParams.endpoint = 'http://localhost:8000';
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(dynamoDbClientParams);

app.use(express.json());

// const retrieveValue = async (retrievedUser) => {
//   const params = {
//     TableName: VALUES_TABLE,
//     Key: {
//       userId: retrievedUser,
//     },
//   };

//   try {
//     const { Item } = await dynamoDbClient.get(params).promise();
//     return Item;
//   } catch (error) {
//     throw "unable to find user input";
//   }
// };

const listValue = async () => {
    const params = {
        TableName: VALUES_TABLE,
    };

    const response = await dynamoDbClient.scan(params).promise();
    console.log(response);
    return response.Items;
};

// const saveValue = async (savedName, savedCollection, savedDescription) => {
//   const params = {
//     TableName: VALUES_TABLE,
//     Item: {
//       name: savedName,
//       collection: savedCollection,
//       description: savedDescription,
//     },
//   };

//   try {
//     await dynamoDbClient.put(params).promise();
//   } catch (error) {
//     console.log(error);
//     throw "unable to save user input";
//   }
// };

// const deleteValue = async (valueName) => {
//   const params = {
//     TableName: process.env.VALUES_TABLE,
//     Key: {
//       name: valueName,
//     },
//   };

//   try {
//     await dynamoDbClient.delete(params).promise();
//   } catch (error) {
//     console.log(error);
//     throw "unable to save user input";
//   }
// };

// health
app.get('/health', async function (req, res) {
    res.status(200).json({ response: 'working successfully' });
});

// read
app.get('/shadow-and-bone-server/list', async function (req, res) {
    try {
        const foundValues = await listValue();
        if (foundValues) {
            res.status(200).json({ values: foundValues });
        } else {
            res.status(404).json({ error: 'could not find any values' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not retreive values' });
    }
});

// read glossary
app.get('/shadow-and-bone-server/list/glossary', async function (req, res) {
    try {
        const foundValues = await listValue();
        if (foundValues) {
            const glossaryOnly = foundValues.filter((value) => {
                if (value.collection === 'glossary') {
                    return true;
                } else {
                    return false;
                }
            });

            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            const glossarySorted = glossaryOnly.sort((a, b) => {
                var nameA = a.name.toUpperCase();
                var nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                return 0;
            });

            res.status(200).json({ values: glossarySorted });
        } else {
            res.status(404).json({ error: 'could not find any values' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not retreive values' });
    }
});

// read locations
app.get('/shadow-and-bone-server/list/locations', async function (req, res) {
    try {
        const foundValues = await listValue();
        if (foundValues) {
            const locationsOnly = foundValues.filter((value) => {
                if (value.collection === 'locations') {
                    return true;
                } else {
                    return false;
                }
            });

            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            const locationsSorted = locationsOnly.sort((a, b) => {
                var nameA = a.name.toUpperCase();
                var nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                return 0;
            });

            res.status(200).json({ values: locationsOnly });
        } else {
            res.status(404).json({ error: 'could not find any values' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Could not retreive values' });
    }
});

// // create
// app.post("/shadow-and-bone-server/create", async function (req, res) {
//   const { name, collection, description } = req.body;
//   if (typeof name !== "string") {
//     return res.status(400).json({ error: '"name" must be a string' });
//   } else if (typeof description !== "string") {
//     return res.status(400).json({ error: '"description" must be a string' });
//   }

//   try {
//     // save value to the user record with the latest score
//     await saveValue(name, collection, description);
//     return res.status(201).json("save successful");
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "could not create value" });
//   }
// });

// // delete
// app.delete("/shadow-and-bone-server/delete/:name", async function (req, res) {
//   const name = req.params.name;

//   await deleteValue(name);

//   return res.status(204).json("delete successful");
// });

app.use((req, res, next) => {
    return res.status(404).json({
        error: 'Not Found',
    });
});

module.exports.handler = serverless(app);
