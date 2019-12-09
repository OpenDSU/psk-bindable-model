const data = require("./data.json");
const BindableModel = require("../lib/PskBindableModel.js");

let testData = Object.assign({}, data);

let model = BindableModel.setModel(testData);

model.onChange("name.label",(chain)=>{
    console.log(chain, "changed");
});

//model.name.label = "Enter your fullname";