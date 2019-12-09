require("../../../psknode/bundles/pskruntime");
const assert = require("../../double-check").assert;
const data = require("./data.json");
const BindableModel = require("../lib/PskBindableModel.js");
let testData = Object.assign({}, data);
let model = BindableModel.setModel(testData);

assert.callback("simple chain test", (done) => {

    let changesCount = 0;
    const changes = [{chain: "name", value: "Rafael"}, {chain: "email", value: "raf@rms.ro"}];

    function makeSimpleChainTest(change){
        model.onChange(change.chain, function(changedChain){
            assert.equal(changedChain, change.chain);

            changesCount++;
            if(changesCount === changes.length){
                done();
            }
        });
        model.setChainValue(change.chain, change.value);
    }

    changes.forEach(makeSimpleChainTest);

},4000);

assert.callback("simple model change test", (done) => {

    let changesCount = 0;
    const changes = [{chain: "name", value: "Rafael"}, {chain: "email", value: "raf@rms.ro"}];

    function makeModelChangeTest(change){
        model.onChange(change.chain, function(changedChain){
            assert.equal(changedChain, change.chain);

            changesCount++;
            if(changesCount === changes.length){
                done();
            }
        });
        model[change.chain] = change.value;
    }

    changes.forEach(makeModelChangeTest);

});

assert.callback("multiple chain model change test", (done) => {

    let changesCount = 0;
    const changes = [{chain: "name.label", value: "Rafael"}];

    function makeModelChangeTest(change){
        model.onChange(change.chain, function(changedChain){
            assert.equal(changedChain, change.chain);

            changesCount++;
            if(changesCount === changes.length){
                done();
            }
        });
        model[change.chain] = change.value;
    }

    changes.forEach(makeModelChangeTest);

});
