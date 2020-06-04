'use strict';

exports.__esModule = true;
exports.TimeText = exports.DateLabel = exports.Text = exports.Subtitle = undefined;

var _native = require('styled-components/native');

var _native2 = _interopRequireDefault(_native);

var _colors = require('./colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Subtitle = exports.Subtitle = (0, _native2.default)('Text').withConfig({
  displayName: 'typography__Subtitle',
  componentId: 'sc-1roz3w1-0'
})(['font-size:20px;font-weight:400;color:', ';text-align:', ';@media (max-width:700px){font-size:18px;}'], _colors2.default.black, function (props) {
  return props.align || 'center';
});

var Text = exports.Text = (0, _native2.default)('Text').withConfig({
  displayName: 'typography__Text',
  componentId: 'sc-1roz3w1-1'
})(['font-size:14px;font-weight:300;line-height:', 'px;color:', ';margin:5px 0;'], 14 * 1.37, _colors2.default.grey);

var DateLabel = exports.DateLabel = (0, _native2.default)('Text').withConfig({
  displayName: 'typography__DateLabel',
  componentId: 'sc-1roz3w1-2'
})(['font-size:20px;font-weight:400;color:', ';height:30px;text-align:', ';@media (max-width:700px){font-size:12px;}'], _colors2.default.black, function (props) {
  return props.align || 'center';
});

var TimeText = exports.TimeText = (0, _native2.default)('Text').withConfig({
  displayName: 'typography__TimeText',
  componentId: 'sc-1roz3w1-3'
})(['font-size:14px;font-weight:300;line-height:', 'px;color:', ';margin:0;@media (max-width:699px){font-size:10px;}text-align:right;'], 14 * 1.37, _colors2.default.grey);