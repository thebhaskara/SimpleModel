(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        module.exports = factory(lodash);
    } else {
        root.SimpleModel = factory(_);
    }
}(this, function(lodash) {
    'use strict'

    function SimpleModel(object, options) {
        if (!lodash.isObject(object)) return;

        var that = this,
            attributes = that.$attributes = {},
            namespace = that.$namespace = (options && options.namespace) || 'root';

        that.$watchers = {};
        that.$parent = options && options.parent;

        lodash.each(object, function(value, key) {

            var keyNamespace = key;

            setObject(attributes, key, value, keyNamespace, that);

            Object.defineProperty(that, key, {

                get: function() {
                    return attributes[key];
                },

                set: function(newValue) {
                    setObject(attributes, key, newValue, keyNamespace, that);
                    that.$trigger(keyNamespace, 'change', newValue);
                },

                enumerable: true,
                configurable: true
            });

        });
    }

    function setObject(attributes, key, value, keyNamespace, parent) {

        if (lodash.isObject(value)) {
            // if object is of object type
            attributes[key] = new SimpleModel(value, {
                namespace: keyNamespace,
                parent: parent
            })
        } else if (lodash.isArray(value)) {
            return;
        } else if (lodash.isFunction(value)) {
            return;
        } else {
            // if value is of primitive type
            attributes[key] = value;
        }
    }

    SimpleModel.prototype.$watch = function(namespace, event, callback) {
        var watcher = this.$watchers[namespace];
        if (!watcher) {
            watcher = this.$watchers[namespace] = {};
        }

        var cbs = watcher[event];
        if (!cbs) {
            cbs = watcher[event] = {};
        }

        var id = lodash.uniqueId('c-');
        cbs[id] = callback;

        return id;
    }

    SimpleModel.prototype.$unwatch = function(id) {
        var needToContinue = true;
        lodash.each(this.$watchers, function(watcher) {
            lodash.each(watcher, function(cbs) {
                lodash.each(cbs, function(cd, cbid) {
                    if (id == cbid) {
                        delete cbs[cbid];
                        return needToContinue = false;
                    }
                });
                return needToContinue;
            })
            return needToContinue;
        })
    }

    SimpleModel.prototype.$trigger = function(namespace, event, value) {
        var watcher = this.$watchers[namespace];
        if (!watcher) return;

        var cbs = watcher[event];
        if (!cbs) return;

        lodash.each(cbs, function(callback) {
            callback && callback(value);
        });
    }

    return SimpleModel;

}));
