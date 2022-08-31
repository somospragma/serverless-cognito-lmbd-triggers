const AWS = require('aws-sdk');

exports.handler = async (event, context, callback) => {
    const userName = event.userName;
    const d = new Date();
    console.log("Time:", d.getTime());
    let ms = Math.round((d.getTime()/1000))+Number(process.env.sessionTimeOutSeconds);
    console.log("Time:", ms, process.env.sessionTimeOutSeconds);
    registreSessionActive(userName, ms);
    callback(null, event);
};

const registreSessionActive = async (userName, timeOut) => {
    const params = {
        TableName: process.env.auditTable,
        Item: {
            ClientId: {"S":process.env.clientId},
            UserName: {"S":userName},
            expdate: {"N":`${timeOut}`},
            Status: {"N":"1"}
        }
    };
    const dynamodb = new AWS.DynamoDB();
    await dynamodb.putItem(params).promise();
}

