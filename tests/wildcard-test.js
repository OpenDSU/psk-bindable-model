require("../../../psknode/bundles/testsRuntime");
require("../../../psknode/bundles/bindableModel");
const assert = require("double-check").assert;
const data = require("./data.json");

wprint = console.error;

const BindableModel = require("psk-bindable-model");

function getCleanModel(){
    return JSON.parse(JSON.stringify(data));
}

assert.callback("Wildcard test - multiple changes", (done) => {

    let testData = getCleanModel();
    delete testData['favoriteBooks'];
    delete testData['primitive_nicknames'];
    delete testData['object_nicknames'];
    let model = BindableModel.setModel(testData);

    let expectedChanges = 3; // 2 timeout callbacks + one setChainValue
    let finished = false;
    model.onChange("*", function (message) {

        assert.equal(finished,false, "No more callbacks changes were expected");
        expectedChanges --;
        if(expectedChanges === 0){
            finished = true;
            done();
        }
    });

    setTimeout(() => {
        model.name.label = "Your name should be here";
    }, 20);

    model.setChainValue("birthdate", {
        value: {
            "day": "1",
            "month": "January",
            "year": 2000
        }
    });

    setTimeout(() => {
        model.setChainValue("name.label", "Set your name here");
        model.birthdate.value.month = "December";
    }, 200);

});
