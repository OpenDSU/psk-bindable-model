require("../../../psknode/bundles/bindableModel");
const assert = require("../../double-check").assert;
const data = require("./data.json");

wprint = console.error;

const BindableModel = require("psk-bindable-model");

function getCleanModel(){
    return JSON.parse(JSON.stringify(data));
}


assert.callback("Simple chain test", (done) => {
    let testData = getCleanModel();
    delete testData['favoriteBooks'];
    let model = BindableModel.setModel(testData);

    let changesCount = 0;
    const changes = [{chain: "name", value: "Rafael"}, {chain: "email", value: "raf@rms.ro"}];

    function makeSimpleChainTest(change){
        model.onChange(change.chain, function(changedChain){
            assert.equal(changedChain.chain, change.chain);

            changesCount++;
            if(changesCount === changes.length){
                done();
            }
        });
        model.setChainValue(change.chain, change.value);
    }

    changes.forEach(makeSimpleChainTest);

});

