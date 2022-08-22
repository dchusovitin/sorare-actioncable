"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionCable = void 0;

var _ws = _interopRequireDefault(require("ws"));

var _string_decoder = require("string_decoder");

var _subscription = require("./subscription");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var MessageType;

(function (MessageType) {
  MessageType["Welcome"] = "welcome";
  MessageType["Ping"] = "ping";
  MessageType["Confirmation"] = "confirm_subscription";
  MessageType["Rejection"] = "reject_subscription";
  MessageType["Disconnect"] = "disconnect";
})(MessageType || (MessageType = {}));

var ActionCable = /*#__PURE__*/function () {
  function ActionCable(options) {
    _classCallCheck(this, ActionCable);

    // options
    this.url = options.url || 'wss://ws.sorare.com/cable';
    this.origin = options.origin;
    this.headers = options.headers || {}; // heartbeat state

    this.lastHeartbeatTimestamp = 0;
    this.heartbeatInterval = undefined; // web socket

    this.connection = undefined;
    this.subscriptions = {};
    this.connectionPromise = this.connect();
  }

  _createClass(ActionCable, [{
    key: "subscribe",
    value: function subscribe(query, callbacks) {
      var identifier = JSON.stringify({
        channel: 'GraphqlChannel',
        channelId: Math.random().toString(36).substring(2, 8) // temporary

      });

      if (this.subscriptions[identifier]) {
        throw new Error('Already subscribed to this event.');
      }

      this.subscriptions[identifier] = new _subscription.Subscription(query, identifier, this.connectionPromise, callbacks);
      return this.subscriptions[identifier];
    }
  }, {
    key: "connect",
    value: function connect() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var connection = new _ws.default(_this.url, undefined, {
          origin: _this.origin,
          headers: _this.headers
        });
        connection.on('error', function (err) {
          _this.disconnect(err);

          reject(err);
        });
        connection.on('close', function () {
          return _this.disconnect('closed');
        });
        connection.on('message', function (msg) {
          var decoder = new _string_decoder.StringDecoder('utf8');
          var data = JSON.parse(decoder.write(msg));

          _this.handleMessage(data);
        });
        connection.on('open', function () {
          _this.heartbeatInterval = setInterval(function () {
            return _this.checkHeartbeat();
          }, 10000);
          resolve(connection);
        });
        _this.connection = connection;
      });
    }
  }, {
    key: "disconnect",
    value: function disconnect(err) {
      var _this2 = this;

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      Object.entries(this.subscriptions).forEach(function (_ref) {
        var _subscription$callbac, _subscription$callbac2;

        var _ref2 = _slicedToArray(_ref, 2),
            query = _ref2[0],
            subscription = _ref2[1];

        (_subscription$callbac = (_subscription$callbac2 = subscription.callbacks).disconnected) === null || _subscription$callbac === void 0 ? void 0 : _subscription$callbac.call(_subscription$callbac2, err);
        delete _this2.subscriptions[query];
      });
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(data) {
      var _sub$callbacks$connec, _sub$callbacks, _sub$callbacks$reject, _sub$callbacks2;

      var sub = this.subscriptions[data.identifier];

      if (!sub) {
        return;
      }

      var type = data.type;

      switch (type) {
        case MessageType.Welcome:
          break;

        case MessageType.Ping:
          this.lastHeartbeatTimestamp = +new Date();
          break;

        case MessageType.Confirmation:
          (_sub$callbacks$connec = (_sub$callbacks = sub.callbacks).connected) === null || _sub$callbacks$connec === void 0 ? void 0 : _sub$callbacks$connec.call(_sub$callbacks);
          break;

        case MessageType.Rejection:
          (_sub$callbacks$reject = (_sub$callbacks2 = sub.callbacks).rejected) === null || _sub$callbacks$reject === void 0 ? void 0 : _sub$callbacks$reject.call(_sub$callbacks2);
          break;

        case MessageType.Disconnect:
          this.disconnect(data.reason);
          break;

        default:
          sub.callbacks.received(data.message);
          break;
      }
    }
  }, {
    key: "checkHeartbeat",
    value: function checkHeartbeat() {
      if (!this.connection || !this.lastHeartbeatTimestamp) {
        return;
      }

      var isFlat = this.lastHeartbeatTimestamp + 10 * 1000 < +new Date();

      if (isFlat) {
        this.connection.close();
      }
    }
  }]);

  return ActionCable;
}();

exports.ActionCable = ActionCable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC50cyJdLCJuYW1lcyI6WyJNZXNzYWdlVHlwZSIsIkFjdGlvbkNhYmxlIiwib3B0aW9ucyIsInVybCIsIm9yaWdpbiIsImhlYWRlcnMiLCJsYXN0SGVhcnRiZWF0VGltZXN0YW1wIiwiaGVhcnRiZWF0SW50ZXJ2YWwiLCJ1bmRlZmluZWQiLCJjb25uZWN0aW9uIiwic3Vic2NyaXB0aW9ucyIsImNvbm5lY3Rpb25Qcm9taXNlIiwiY29ubmVjdCIsInF1ZXJ5IiwiY2FsbGJhY2tzIiwiaWRlbnRpZmllciIsIkpTT04iLCJzdHJpbmdpZnkiLCJjaGFubmVsIiwiY2hhbm5lbElkIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwic3Vic3RyaW5nIiwiRXJyb3IiLCJTdWJzY3JpcHRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIldlYlNvY2tldCIsIm9uIiwiZXJyIiwiZGlzY29ubmVjdCIsIm1zZyIsImRlY29kZXIiLCJTdHJpbmdEZWNvZGVyIiwiZGF0YSIsInBhcnNlIiwid3JpdGUiLCJoYW5kbGVNZXNzYWdlIiwic2V0SW50ZXJ2YWwiLCJjaGVja0hlYXJ0YmVhdCIsImNsZWFySW50ZXJ2YWwiLCJPYmplY3QiLCJlbnRyaWVzIiwiZm9yRWFjaCIsInN1YnNjcmlwdGlvbiIsImRpc2Nvbm5lY3RlZCIsInN1YiIsInR5cGUiLCJXZWxjb21lIiwiUGluZyIsIkRhdGUiLCJDb25maXJtYXRpb24iLCJjb25uZWN0ZWQiLCJSZWplY3Rpb24iLCJyZWplY3RlZCIsIkRpc2Nvbm5lY3QiLCJyZWFzb24iLCJyZWNlaXZlZCIsIm1lc3NhZ2UiLCJpc0ZsYXQiLCJjbG9zZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBUUtBLFc7O1dBQUFBLFc7QUFBQUEsRUFBQUEsVztBQUFBQSxFQUFBQSxXO0FBQUFBLEVBQUFBLFc7QUFBQUEsRUFBQUEsVztBQUFBQSxFQUFBQSxX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O0FBQ0YsYUFBS3hELFdBQVcsQ0FBQ3lELFVBQWpCO0FBQ0UsZUFBS3pCLFVBQUwsQ0FBZ0JJLElBQUksQ0FBQ3NCLE1BQXJCO0FBQ0E7O0FBQ0Y7QUFDRVYsVUFBQUEsR0FBRyxDQUFDbEMsU0FBSixDQUFjNkMsUUFBZCxDQUF1QnZCLElBQUksQ0FBQ3dCLE9BQTVCO0FBQ0E7QUFqQko7QUFtQkQ7OztXQUVELDBCQUF5QjtBQUN2QixVQUFJLENBQUMsS0FBS25ELFVBQU4sSUFBb0IsQ0FBQyxLQUFLSCxzQkFBOUIsRUFBc0Q7QUFDcEQ7QUFDRDs7QUFFRCxVQUFNdUQsTUFBTSxHQUFHLEtBQUt2RCxzQkFBTCxHQUE4QixLQUFLLElBQW5DLEdBQTBDLENBQUMsSUFBSThDLElBQUosRUFBMUQ7O0FBQ0EsVUFBSVMsTUFBSixFQUFZO0FBQ1YsYUFBS3BELFVBQUwsQ0FBZ0JxRCxLQUFoQjtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViU29ja2V0IGZyb20gJ3dzJztcbmltcG9ydCB7IFN0cmluZ0RlY29kZXIgfSBmcm9tICdzdHJpbmdfZGVjb2Rlcic7XG5cbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgQ2FsbGJhY2tzIH0gZnJvbSAnLi9zdWJzY3JpcHRpb24nO1xuXG5leHBvcnQgdHlwZSBPcHRpb25zID0ge1xuICB1cmw/OiBzdHJpbmc7XG4gIG9yaWdpbj86IHN0cmluZztcbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59O1xuXG5lbnVtIE1lc3NhZ2VUeXBlIHtcbiAgV2VsY29tZSA9ICd3ZWxjb21lJyxcbiAgUGluZyA9ICdwaW5nJyxcbiAgQ29uZmlybWF0aW9uID0gJ2NvbmZpcm1fc3Vic2NyaXB0aW9uJyxcbiAgUmVqZWN0aW9uID0gJ3JlamVjdF9zdWJzY3JpcHRpb24nLFxuICBEaXNjb25uZWN0ID0gJ2Rpc2Nvbm5lY3QnLFxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uQ2FibGUge1xuICBwcml2YXRlIHVybDogc3RyaW5nO1xuXG4gIHByaXZhdGUgb3JpZ2luPzogc3RyaW5nO1xuXG4gIHByaXZhdGUgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICBwcml2YXRlIGNvbm5lY3Rpb24/OiBXZWJTb2NrZXQ7XG5cbiAgcHJpdmF0ZSBjb25uZWN0aW9uUHJvbWlzZTogUHJvbWlzZTxXZWJTb2NrZXQ+O1xuXG4gIHByaXZhdGUgc3Vic2NyaXB0aW9uczogUmVjb3JkPHN0cmluZywgU3Vic2NyaXB0aW9uPjtcblxuICBwcml2YXRlIGxhc3RIZWFydGJlYXRUaW1lc3RhbXA6IG51bWJlcjtcblxuICBwcml2YXRlIGhlYXJ0YmVhdEludGVydmFsPzogTm9kZUpTLlRpbWVyO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IE9wdGlvbnMpIHtcbiAgICAvLyBvcHRpb25zXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnd3NzOi8vd3Muc29yYXJlLmNvbS9jYWJsZSc7XG4gICAgdGhpcy5vcmlnaW4gPSBvcHRpb25zLm9yaWdpbjtcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG5cbiAgICAvLyBoZWFydGJlYXQgc3RhdGVcbiAgICB0aGlzLmxhc3RIZWFydGJlYXRUaW1lc3RhbXAgPSAwO1xuICAgIHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWwgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyB3ZWIgc29ja2V0XG4gICAgdGhpcy5jb25uZWN0aW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IHt9O1xuICAgIHRoaXMuY29ubmVjdGlvblByb21pc2UgPSB0aGlzLmNvbm5lY3QoKTtcbiAgfVxuXG4gIHN1YnNjcmliZShxdWVyeTogc3RyaW5nLCBjYWxsYmFja3M6IENhbGxiYWNrcyk6IFN1YnNjcmlwdGlvbiB7XG4gICAgY29uc3QgaWRlbnRpZmllciA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGNoYW5uZWw6ICdHcmFwaHFsQ2hhbm5lbCcsXG4gICAgICBjaGFubmVsSWQ6IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KSwgLy8gdGVtcG9yYXJ5XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zW2lkZW50aWZpZXJdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FscmVhZHkgc3Vic2NyaWJlZCB0byB0aGlzIGV2ZW50LicpO1xuICAgIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9uc1tpZGVudGlmaWVyXSA9IG5ldyBTdWJzY3JpcHRpb24oXG4gICAgICBxdWVyeSxcbiAgICAgIGlkZW50aWZpZXIsXG4gICAgICB0aGlzLmNvbm5lY3Rpb25Qcm9taXNlLFxuICAgICAgY2FsbGJhY2tzXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5zdWJzY3JpcHRpb25zW2lkZW50aWZpZXJdO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25uZWN0KCk6IFByb21pc2U8V2ViU29ja2V0PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgV2ViU29ja2V0KHRoaXMudXJsLCB1bmRlZmluZWQsIHtcbiAgICAgICAgb3JpZ2luOiB0aGlzLm9yaWdpbixcbiAgICAgICAgaGVhZGVyczogdGhpcy5oZWFkZXJzLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICB0aGlzLmRpc2Nvbm5lY3QoZXJyKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICAgIGNvbm5lY3Rpb24ub24oJ2Nsb3NlJywgKCkgPT4gdGhpcy5kaXNjb25uZWN0KCdjbG9zZWQnKSk7XG4gICAgICBjb25uZWN0aW9uLm9uKCdtZXNzYWdlJywgKG1zZzogV2ViU29ja2V0LlJhd0RhdGEpID0+IHtcbiAgICAgICAgY29uc3QgZGVjb2RlciA9IG5ldyBTdHJpbmdEZWNvZGVyKCd1dGY4Jyk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGRlY29kZXIud3JpdGUobXNnIGFzIEJ1ZmZlcikpO1xuICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UoZGF0YSk7XG4gICAgICB9KTtcbiAgICAgIGNvbm5lY3Rpb24ub24oJ29wZW4nLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChcbiAgICAgICAgICAoKSA9PiB0aGlzLmNoZWNrSGVhcnRiZWF0KCksXG4gICAgICAgICAgMTAwMDBcbiAgICAgICAgKTtcbiAgICAgICAgcmVzb2x2ZShjb25uZWN0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkaXNjb25uZWN0KGVycj86IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhlYXJ0YmVhdEludGVydmFsKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuc3Vic2NyaXB0aW9ucykuZm9yRWFjaCgoW3F1ZXJ5LCBzdWJzY3JpcHRpb25dKSA9PiB7XG4gICAgICBzdWJzY3JpcHRpb24uY2FsbGJhY2tzLmRpc2Nvbm5lY3RlZD8uKGVycik7XG4gICAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25zW3F1ZXJ5XTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlTWVzc2FnZShkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YnNjcmlwdGlvbnNbZGF0YS5pZGVudGlmaWVyXTtcbiAgICBpZiAoIXN1Yikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHR5cGUgPSBkYXRhLnR5cGUgYXMgTWVzc2FnZVR5cGU7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgTWVzc2FnZVR5cGUuV2VsY29tZTpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE1lc3NhZ2VUeXBlLlBpbmc6XG4gICAgICAgIHRoaXMubGFzdEhlYXJ0YmVhdFRpbWVzdGFtcCA9ICtuZXcgRGF0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTWVzc2FnZVR5cGUuQ29uZmlybWF0aW9uOlxuICAgICAgICBzdWIuY2FsbGJhY2tzLmNvbm5lY3RlZD8uKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBNZXNzYWdlVHlwZS5SZWplY3Rpb246XG4gICAgICAgIHN1Yi5jYWxsYmFja3MucmVqZWN0ZWQ/LigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgTWVzc2FnZVR5cGUuRGlzY29ubmVjdDpcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0KGRhdGEucmVhc29uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdWIuY2FsbGJhY2tzLnJlY2VpdmVkKGRhdGEubWVzc2FnZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tIZWFydGJlYXQoKSB7XG4gICAgaWYgKCF0aGlzLmNvbm5lY3Rpb24gfHwgIXRoaXMubGFzdEhlYXJ0YmVhdFRpbWVzdGFtcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzRmxhdCA9IHRoaXMubGFzdEhlYXJ0YmVhdFRpbWVzdGFtcCArIDEwICogMTAwMCA8ICtuZXcgRGF0ZSgpO1xuICAgIGlmIChpc0ZsYXQpIHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuIl19