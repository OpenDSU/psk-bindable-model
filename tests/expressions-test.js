require("../../../psknode/bundles/testsRuntime");
require("../../../psknode/bundles/bindableModel");

const assert = require("../../double-check").assert;
const data = require("./data.json");
const BindableModel = require("psk-bindable-model");


wprint = function(message){
    console.log.apply("WPRINT:\n"+message)
};


function getCleanModel() {
    return JSON.parse(JSON.stringify(data));
}

assert.callback("Expression should be added", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';

    model.addExpression(expressionName, function () {
        return 2 * 2;
    })

    assert.equal(true, model.hasExpression(expressionName), "Expression is added");
    done();
});

assert.callback("Expression should be evaluated", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    const expressionExpectedResult = 4;

    model.addExpression(expressionName, function () {
        return 2 * 2;
    })

    assert.equal(expressionExpectedResult, model.evaluateExpression(expressionName), "Expression is evaluated");
    done();
});

assert.callback("Expression should be evaluated to a promise", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';

    model.addExpression(expressionName, function () {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    })

    const expressionResult = model.evaluateExpression(expressionName);
    assert.equal(true, expressionResult instanceof Promise, "Expression result is a Promise");
    done();
});

assert.callback("Expression promise should resolve to a known value", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    const expressionExpectedResult = 4;
    let expressionActualResult;

    model.addExpression(expressionName, function () {
        return new Promise(function (resolve, reject) {
            resolve(2 + 2);
        });
    })

    const expressionResult = model.evaluateExpression(expressionName);
    assert.equal(true, expressionResult instanceof Promise, "Expression result is a Promise");

    expressionResult.then((result) => {
        expressionActualResult = result;
    }).finally(() => {
        assert.equal(true, expressionExpectedResult === expressionActualResult, "Expression promise resolved to expected value");
        done();
    })
});

assert.callback("Expression callback is binded to proxy", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    let expressionSelf;

    model.addExpression(expressionName, function () {
        expressionSelf = this;
    })

    model.evaluateExpression(expressionName);

    assert.equal(true, expressionSelf === model, "Expression callback is binded to model");
    done();
})

assert.callback("Expression throws an error if arguments are invalid", (done) => {
    let data = getCleanModel();
    let model = BindableModel.setModel(data);

    const expressionName = 'test';
    let err;

    try {
        model.addExpression(expressionName);
    } catch (e) {
        err = e;
    }
    assert.equal("Expression must have a callback", err.message, "Invalid callback error message");

    try {
        model.addExpression('', function () {});
    } catch (e) {
        err = e;
    }
    assert.equal("Expression name must be a valid string", err.message, "Invalid expression name error message");
    done();
});
