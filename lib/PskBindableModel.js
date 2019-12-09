class PskBindableModel {

    static setModel(_model) {
        let root = undefined;

        function makeChain(parentChain, currentChain) {
            return parentChain ? parentChain + "." + currentChain : currentChain
        }

        function makeSetter(parentChain) {
            return function (obj, prop, value) {
                let chain = makeChain(parentChain, prop);
                if (typeof value === "object") {
                    obj[prop] = proxify(value, chain);
                    proxifyNestedObjects(obj[prop]);
                } else {
                    obj[prop] = value;
                }
                root.notify(parentChain, prop, value);
                return true;
            }
        }

        function makeArrayGetter(parentChain) {
            return function (target, prop) {
                const val = target[prop];
                if (typeof val === 'function') {
                    if (['push', 'unshift', 'pop', 'copyWithin'].includes(prop)) {
                        return function (el) {
                            try {
                                let returnedValue = Array.prototype[prop].apply(target, arguments);
                                root.notify(parentChain, prop);
                                return returnedValue;
                            } catch (e) {
                                console.log("An error occured in Proxy");
                                throw e;
                            }
                        }
                    }

                    return val.bind(target);
                }
                /**TODO
                 * do we need this? Array.isArray(proxified array) works as expected
                 */
                if(prop === "isArray"){
                    return function(){
                        return true;
                    };
                }
                return val;
            }
        }

        function proxifyNestedObjects(obj) {
            for (let prop in obj) {
                if (typeof obj[prop] === "object") {
                    obj[prop] = obj[prop];
                    proxifyNestedObjects(obj[prop]);
                }
            }
        }

        function getObjectChains (parentChain, parentObj){
            let chains = [parentChain];

            let fn = function(parent, obj){
                if(typeof obj === "object" && !Array.isArray(obj)){
                    for (let prop in obj){
                         (fn(parent+"."+prop, obj[prop]));
                    }
                }
                else{
                    chains.push(parent);
                }
            };

            fn(parentChain, parentObj);
            return chains;
        }

        function proxify(obj, parentChain) {
            let isRoot = !parentChain;
            let notify, onChange, getChainValue, setChainValue;
            if (isRoot) {
                let observers = {};
                notify = function (parentChain, property, value) {
                    let changedChain = property;
                    if (parentChain) {
                        changedChain = parentChain + "." + changedChain;
                    }

                    function notifyChain(chain) {
                        let chainSequence = chain.split(".").map(el => el.trim());
                        let notifierReducer = (accumulator, currentValue, index) => {

                            if (index === 0) {
                                accumulator = currentValue;
                            } else {
                                accumulator += "." + currentValue;
                            }
                            if (accumulator !== null && typeof accumulator !== 'undefined') {
                                if (observers[accumulator]) {
                                    observers[accumulator].forEach(callback => {
                                        setTimeout(() => {
                                            callback(chain)
                                        }, 0);
                                    })
                                }
                            }
                            return accumulator;
                        };
                        return chainSequence.reduce(notifierReducer, "");
                    }
                    //TODO
                    //notifyChain(getObjectChains(changedChain, value))
                    notifyChain(changedChain);
                    notifyChain("*");
                };

                getChainValue = function (chain) {
                    let chainSequence = chain.split(".").map(el => el.trim());
                    let reducer = (accumulator, currentValue) => {
                        if (accumulator !== null && typeof accumulator !== 'undefined') {
                            return accumulator[currentValue];
                        }
                        return undefined;
                    };
                    return chainSequence.reduce(reducer, root);
                };

                setChainValue = function (chain, value) {
                    let chainSequence = chain.split(".").map(el => el.trim());

                    let reducer = (accumulator, currentValue, index, array) => {
                        if (accumulator !== null && typeof accumulator !== 'undefined') {
                            if (index === array.length - 1) {
                                accumulator[currentValue] = value;
                                return true;
                            }
                            accumulator = accumulator[currentValue];
                            return accumulator;
                        }
                        return undefined;
                    };
                    return chainSequence.reduce(reducer, root);
                };

                onChange = function (chain, callback) {
                    if (typeof callback === "function") {
                        if (!observers[chain]) {
                            observers[chain] = [];
                        }
                        observers[chain].push(callback);
                    }
                }
            }
            let setter = makeSetter(parentChain);

            let objectHandler = {
                get: function (obj, prop) {
                    if (isRoot) {
                        switch (prop) {
                            case "onChange":
                                return onChange;
                            case "notify":
                                return notify;
                            case "getChainValue":
                                return getChainValue;
                            case "setChainValue":
                                return setChainValue;
                        }
                    }

                    return obj[prop];
                },
                set: makeSetter(parentChain),

                deleteProperty: function (oTarget, sKey) {
                    delete oTarget[sKey];
                },

                ownKeys: function (oTarget) {
                    return Object.keys(oTarget);
                },
                has: function (oTarget, sKey) {
                    return sKey in oTarget
                },
                defineProperty: function (oTarget, sKey, oDesc) {
                    let oDescClone = Object.assign({}, oDesc);
                    oDescClone.set = function (obj, prop, value) {
                        if (oDesc.hasOwnProperty("set")) {
                            oDesc.set(obj, prop, value);
                        }
                        setter(obj, prop, value);
                    };
                    return Object.defineProperty(oTarget, sKey, oDescClone);
                },
                getOwnPropertyDescriptor: function (oTarget, sKey) {
                    return Object.getOwnPropertyDescriptor(oTarget, sKey)
                }
            };

            let arrayHandler = {
                get: makeArrayGetter(parentChain),
                set: makeSetter(parentChain)
            };

            let handler = Array.isArray(obj) ? arrayHandler : objectHandler
            return new Proxy(obj, handler);
        }

        root = proxify(_model);
        proxifyNestedObjects(root);
        return root;
    }
}

module.exports = PskBindableModel