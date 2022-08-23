exports.ok = (values, message) => {
    return {
        resCode: '200',
        resDesc: message,
        values
    }
};

exports.fetchById = (values, message) => {
    return {
        resCode: '200',
        resDesc: message,
        value
    }
};

exports.okDelete = (message) => {
    return {
        resCode: '200',
        resDesc: message,
    }
};

exports.create = (values, message) => {
    return {
        resCode: '201',
        resDesc: message,
        values
    }
}

exports.update = (values, message) => {
    return {
        resCode: '204',
        resDesc: message,
        value
    }
}

exports.bad = (message) => {
    return {
        resCode: '400',
        resDesc: message
    }
}

exports.nodeFound = (message) => {
    return {
        resCode: '404',
        resDesc: message
    }
}

exports.auth = (message) => {
    return {
        resCode: '401',
        resDesc: message
    }
}

exports.found = (message) => {
    return {
        resCode: '422',
        resDesc: message
    }
}