require("../../../psknode/bundles/bindableModel");
const assert = require("../../double-check").assert;
const data = require("./data.json");

wprint = console.error;

const BindableModel = require("psk-bindable-model");

function getCleanModel(){
    return JSON.parse(JSON.stringify(data));
}



assert.callback("multiple chain change test", (done) => {

    let testData = getCleanModel();
    delete testData['favoriteBooks'];
    let model = BindableModel.setModel(testData);

    let chainChangesExpected = ["name", "name.label", "name.text", "name.meta"];

    let expectedEvents = chainChangesExpected.length;
    chainChangesExpected.forEach((chain) => {
        model.onChange(chain, function (message) {

            let changedChain = message.chain;
            //after the change event is received, we remove the chain to be sure that the event
            // is not triggered multiple times for a single change

            assert.equal(changedChain, chain, "Chains should be equals");
            assert.notEqual(chainChangesExpected.indexOf(changedChain), -1, "Chain was already removed");
            chainChangesExpected.splice(chainChangesExpected.indexOf(changedChain), 1);
            expectedEvents--;
            if (expectedEvents === 0 && chainChangesExpected.length === 0) {
                done();
            }
        });
    });

    model.name = {label:"", meta:{data:"txt"}}
    model.setChainValue("name.label","First name");
    model.setChainValue("name.text","value");
    model.setChainValue("name.meta",{"data": "Rafael"});

});
