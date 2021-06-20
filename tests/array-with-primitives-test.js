require("../../../psknode/bundles/testsRuntime");
require("../../../psknode/bundles/bindableModel");

const assert = require("double-check").assert;
const data = require("./data.json");
const BindableModel = require("psk-bindable-model");


wprint = function(message){
    console.log.apply("WPRINT:\n"+message)
};

function getCleanModel() {
    return JSON.parse(JSON.stringify(data));
}

assert.callback("Array with primitives test", (done) => {

    let data = getCleanModel();
    delete data.name;
    delete data.email;
    delete data.birthdate;
    delete data.favoriteBooks;
    delete data.object_nicknames;
    let model = BindableModel.setModel(data);

    let changesCount = 0;
    let expectedChanges = 1;
    let finished = false;

    let checkCounter = function(){
        assert.equal(false, finished,"No more changes were expected!");
        changesCount++;
        if(changesCount === expectedChanges){
                finished = true;
                done();
        }
    };

    let getCallback = function (_chain){
        return function(message){
            assert.equal(message.chain,_chain,"Chains are not identical")
            checkCounter();
        }
    };

    model.onChange("primitive_nicknames",getCallback("primitive_nicknames"));

    model.primitive_nicknames.push("D");
    model.primitive_nicknames.push("E");
    model.primitive_nicknames.shift();
    model.primitive_nicknames.shift();
    model.primitive_nicknames.pop();
    model.primitive_nicknames.unshift("Z","X");

});

