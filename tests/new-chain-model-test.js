require("../../../builds/output/testsRuntime");
require("../../../builds/output/bindableModel");
const assert = require("double-check").assert;
const data = require("./data.json");

wprint = console.error;

const BindableModel = require("psk-bindable-model");

function getCleanModel() {
    return JSON.parse(JSON.stringify(data));
}

assert.callback("New Chain model test", (done) => {
    let model = BindableModel.setModel(getCleanModel());

    const contactListOptions = [{
        contactId: "1",
        options: ["speed-dial", "contact-image"]
    }, {
        contactId: "2",
        options: ["blocked"]
    }, {
        contactId: "3",
        options: ["special-ringtone", "screen-shortcut"]
    }];

    model.onChange("contact_list", function (changedChain) {
        assert.true(changedChain.chain, 'contact_list');
        assert.true(model[changedChain.chain]['options'].length, 3);

        done();
    });

    model["contact_list"]["options"] = contactListOptions;
});