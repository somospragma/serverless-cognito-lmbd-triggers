exports.handler = async (event, context, callback) => {
    let newScopes = getScopes(event);
    event.response = {
        "claimsOverrideDetails": {
            "claimsToAddOrOverride": {
                "scope": newScopes.join(" "),
            }
        }
    };
    return event;
}

const getScopes = (event) => {
    return event.request.groupConfiguration.groupsToOverride.map(item => `${item}-${event.callerContext.clientId}`);
};