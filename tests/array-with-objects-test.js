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

assert.callback("Array with objects test", (done) => {

    let data = getCleanModel();
    delete data.name;
    delete data.email;
    delete data.birthdate;
    delete data.favoriteBooks;
    delete data.primitive_nicknames;
    let model = BindableModel.setModel(data);

    let changesCount = 0;
    let expectedChanges = 2;
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
            assert.equal(message.chain,_chain,"Chains are not identical");
            checkCounter();
        }
    };

    model.onChange("object_nicknames",getCallback("object_nicknames"));
    model.onChange("object_nicknames.1.nickname",getCallback("object_nicknames.1.nickname"));

    model.object_nicknames.push({id: 4, nickname: "D"});
    model.object_nicknames.push({id: 5, nickname: "E"});
    model.object_nicknames[1].nickname = "B'";

});
