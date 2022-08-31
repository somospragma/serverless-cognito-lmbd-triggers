const AWS = require('aws-sdk');

exports.handler = async (event, context, callback) => {
    const userName = event.userName;
    const userPoolIdRequest = event.userPoolId;
    const clientIdRequest = event.callerContext.clientId;

    const userPoolId = process.env.userPoolId;
    const clientId = process.env.clientId;
    console.log(event)
    try {
        if (userPoolId != userPoolIdRequest || clientId != clientIdRequest) {
            const error = new Error("Unauthorized");
            callback(error, event);
        }

        const sessionActive = await validateSessionActive(userName);

        if (sessionActive) {
            const error = new Error("Existe una sesión activa para el usuario");
            callback(error, event);
        }

        callback(null, event);

    } catch (error) {
        const err = new Error("Existe una sesión activa para el usuario");
        console.log(error)
        callback(error, event);
    }


};

const validateSessionActive = async (userName) => {
    const d = new Date();
    let ms = Math.round((d.getTime()/1000));
    const params = {
        TableName: process.env.auditTable,
        ExpressionAttributeNames: {
            "#ClientId": "ClientId",
            "#UserName": "UserName",
            "#Status": "Status",
            "#expdate": "expdate"
        },
        ExpressionAttributeValues: {
            ":ClientId": process.env.clientId,
            ":UserName": userName,
            ":Status": 1, 
            ":expdate": ms
        },
        FilterExpression: "#Status = :Status AND #expdate > :expdate",
        KeyConditionExpression: "#UserName = :UserName AND #ClientId = :ClientId",
    };
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const result = await dynamodb.query(params).promise();

    return result.Items.length > 0;
}
