const assert = require("../../double-check").assert;
const data = require("./data.json");
const BindableModel = require("../lib/PskBindableModel.js");

function cleanModel(){
    return JSON.parse(JSON.stringify(data));
}

assert.callback("simple chain test", (done) => {
    let testData = cleanModel();
    delete testData['favoriteBooks'];
    let model = BindableModel.setModel(testData);

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

});

assert.callback("simple model change test", (done) => {
    let testData = cleanModel();
    delete testData['favoriteBooks'];
    let model = BindableModel.setModel(testData);

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

assert.callback("wildcard test", (done) => {

    let testData = cleanModel();
    delete testData['favoriteBooks'];
    let model = BindableModel.setModel(testData);

    let expectedChanges = ["name.label", "birthdate.value", "name.label","birthdate.value.month"];
    let changesCount = expectedChanges.length;

    model.onChange("*", function (changedChain) {

        assert.notEqual(expectedChanges.indexOf(changedChain), -1, "Chain was already removed");
        expectedChanges.splice(expectedChanges.indexOf(changedChain), 1);

        changesCount --;
        if(changesCount === 0  && expectedChanges.length ===0){
            done();
        }
    });

    model.name.label="Mastaleru";
    model.setChainValue("birthdate",{
        value: {
            "day": "1",
            "month": "January",
            "year": 2000
        }
    });

    model.setChainValue("name.label","R.Mastaleru");
    model.birthdate.value.month = "December";

});


assert.callback("multiple chain model change test", (done) => {

    let testData = cleanModel();
    delete testData['favoriteBooks'];
    let model = BindableModel.setModel(testData);

    let chainChangesExpected = ["name", "name.label", "name.text", "name.meta.data", "name.meta"];

    let expectedEvents = chainChangesExpected.length;
    chainChangesExpected.forEach((chain) => {
        model.onChange(chain, function (changedChain) {

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

    model.name = {"label": "First name", "text": "value", meta: {"data": "Rafael"}};

});
