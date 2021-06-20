require("../../../psknode/bundles/testsRuntime");
require("../../../psknode/bundles/bindableModel");
const assert = require("double-check").assert;
const data = require("./data.json");

wprint = console.error;

const BindableModel = require("psk-bindable-model");

function getCleanModel() {
    return JSON.parse(JSON.stringify(data));
}

assert.callback("Set null values test", (done) => {
    let model = BindableModel.setModel(getCleanModel());

    let changesCount = 0;
    const changes = [{
        chain: "name",
        value: null
    }, {
        chain: "email",
        value: undefined
    }];

    function makeModelChangeTest(change) {
        model.onChange(change.chain, function(changedChain) {
            assert.equal(changedChain.chain, change.chain);

            changesCount++;
            if (changesCount === changes.length) {
                done();
            }
        });
        model[change.chain] = change.value;
    }
    changes.forEach(makeModelChangeTest);
});