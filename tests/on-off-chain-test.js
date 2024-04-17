require("../../../builds/output/testsRuntime");
require("../../../builds/output/bindableModel");
const assert = require("double-check").assert;
const data = require("./data.json");

wprint = console.error;

const BindableModel = require("psk-bindable-model");

function getCleanModel() {
    return JSON.parse(JSON.stringify(data));
}

assert.callback("on - off - chain - test", (done) => {

    let testData = getCleanModel();
    delete testData['favoriteBooks'];
    delete testData['primitive_nicknames'];
    delete testData['object_nicknames'];
    let model = BindableModel.setModel({countries: ["USA", "France", "Australia", "Uruguay"], language: "en"});

    let expectedCalls = 7;

    let executionCalls = 0
    let callback1 = function () {
        executionCalls++;
    }

    let callback2 = function () {
        executionCalls++;
    }

    let callback3 = function () {
        executionCalls++;
    }

    model.onChange("countries", callback1);
    model.onChange("countries", callback1);
    model.onChange("countries", callback1);
    model.onChange("countries", callback2);
    model.onChange("countries", callback3);
    model.onChange("language", callback3);
    model.language = "fr";
    model.countries.splice(-1);

    setTimeout(() => {
        model.offChange("countries", callback1);
        model.offChange("countries", callback2);
        model.offChange("language", callback3);
        model.countries.splice(-1);
        model.language = "en";
    }, 0)


    setTimeout(() => {
        assert.equal(executionCalls, expectedCalls);
        done()
    }, 100);

});
