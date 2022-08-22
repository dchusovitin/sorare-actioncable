"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Subscription = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Subscription = /*#__PURE__*/_createClass(function Subscription(query, identifier, connectionPromise, callbacks) {
  _classCallCheck(this, Subscription);

  this.callbacks = callbacks;

  var send = function send(connection, command, data) {
    var msg = JSON.stringify({
      identifier: identifier,
      command: command,
      data: JSON.stringify(data)
    });
    connection.send(msg);
  };

  connectionPromise.then(function (connection) {
    if (connection.readyState === 1) {
      send(connection, 'subscribe');
      send(connection, 'message', {
        action: 'execute',
        query: "subscription { ".concat(query, " }")
      });
    } else {
      throw new Error('Connection is not opened');
    }
  });
});

exports.Subscription = Subscription;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zdWJzY3JpcHRpb24udHMiXSwibmFtZXMiOlsiU3Vic2NyaXB0aW9uIiwicXVlcnkiLCJpZGVudGlmaWVyIiwiY29ubmVjdGlvblByb21pc2UiLCJjYWxsYmFja3MiLCJzZW5kIiwiY29ubmVjdGlvbiIsImNvbW1hbmQiLCJkYXRhIiwibXNnIiwiSlNPTiIsInN0cmluZ2lmeSIsInRoZW4iLCJyZWFkeVN0YXRlIiwiYWN0aW9uIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFTYUEsWSw2QkFHWCxzQkFDRUMsS0FERixFQUVFQyxVQUZGLEVBR0VDLGlCQUhGLEVBSUVDLFNBSkYsRUFLRTtBQUFBOztBQUNBLE9BQUtBLFNBQUwsR0FBaUJBLFNBQWpCOztBQUVBLE1BQU1DLElBQUksR0FBRyxTQUFQQSxJQUFPLENBQUNDLFVBQUQsRUFBd0JDLE9BQXhCLEVBQXlDQyxJQUF6QyxFQUF3RDtBQUNuRSxRQUFNQyxHQUFHLEdBQUdDLElBQUksQ0FBQ0MsU0FBTCxDQUFlO0FBQ3pCVCxNQUFBQSxVQUFVLEVBQVZBLFVBRHlCO0FBRXpCSyxNQUFBQSxPQUFPLEVBQVBBLE9BRnlCO0FBR3pCQyxNQUFBQSxJQUFJLEVBQUVFLElBQUksQ0FBQ0MsU0FBTCxDQUFlSCxJQUFmO0FBSG1CLEtBQWYsQ0FBWjtBQUtBRixJQUFBQSxVQUFVLENBQUNELElBQVgsQ0FBZ0JJLEdBQWhCO0FBQ0QsR0FQRDs7QUFTQU4sRUFBQUEsaUJBQWlCLENBQUNTLElBQWxCLENBQXVCLFVBQUNOLFVBQUQsRUFBMkI7QUFDaEQsUUFBSUEsVUFBVSxDQUFDTyxVQUFYLEtBQTBCLENBQTlCLEVBQWlDO0FBQy9CUixNQUFBQSxJQUFJLENBQUNDLFVBQUQsRUFBYSxXQUFiLENBQUo7QUFDQUQsTUFBQUEsSUFBSSxDQUFDQyxVQUFELEVBQWEsU0FBYixFQUF3QjtBQUMxQlEsUUFBQUEsTUFBTSxFQUFFLFNBRGtCO0FBRTFCYixRQUFBQSxLQUFLLDJCQUFvQkEsS0FBcEI7QUFGcUIsT0FBeEIsQ0FBSjtBQUlELEtBTkQsTUFNTztBQUNMLFlBQU0sSUFBSWMsS0FBSixDQUFVLDBCQUFWLENBQU47QUFDRDtBQUNGLEdBVkQ7QUFXRCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlNvY2tldCBmcm9tICd3cyc7XG5cbmV4cG9ydCB0eXBlIENhbGxiYWNrcyA9IHtcbiAgY29ubmVjdGVkPzogKCkgPT4gdm9pZDtcbiAgZGlzY29ubmVjdGVkPzogKGVycm9yPzogYW55KSA9PiB2b2lkO1xuICByZWplY3RlZD86ICgpID0+IHZvaWQ7XG4gIHJlY2VpdmVkOiAoZGF0YTogYW55KSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGNsYXNzIFN1YnNjcmlwdGlvbiB7XG4gIGNhbGxiYWNrczogQ2FsbGJhY2tzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHF1ZXJ5OiBzdHJpbmcsXG4gICAgaWRlbnRpZmllcjogc3RyaW5nLFxuICAgIGNvbm5lY3Rpb25Qcm9taXNlOiBQcm9taXNlPFdlYlNvY2tldD4sXG4gICAgY2FsbGJhY2tzOiBDYWxsYmFja3NcbiAgKSB7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBjYWxsYmFja3M7XG5cbiAgICBjb25zdCBzZW5kID0gKGNvbm5lY3Rpb246IFdlYlNvY2tldCwgY29tbWFuZDogc3RyaW5nLCBkYXRhPzogYW55KSA9PiB7XG4gICAgICBjb25zdCBtc2cgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgfSk7XG4gICAgICBjb25uZWN0aW9uLnNlbmQobXNnKTtcbiAgICB9O1xuXG4gICAgY29ubmVjdGlvblByb21pc2UudGhlbigoY29ubmVjdGlvbjogV2ViU29ja2V0KSA9PiB7XG4gICAgICBpZiAoY29ubmVjdGlvbi5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgICAgIHNlbmQoY29ubmVjdGlvbiwgJ3N1YnNjcmliZScpO1xuICAgICAgICBzZW5kKGNvbm5lY3Rpb24sICdtZXNzYWdlJywge1xuICAgICAgICAgIGFjdGlvbjogJ2V4ZWN1dGUnLFxuICAgICAgICAgIHF1ZXJ5OiBgc3Vic2NyaXB0aW9uIHsgJHtxdWVyeX0gfWAsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25uZWN0aW9uIGlzIG5vdCBvcGVuZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19