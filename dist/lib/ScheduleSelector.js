'use strict';

exports.__esModule = true;
exports.preventScroll = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _add_hours = require('date-fns/add_hours');

var _add_hours2 = _interopRequireDefault(_add_hours);

var _add_days = require('date-fns/add_days');

var _add_days2 = _interopRequireDefault(_add_days);

var _start_of_day = require('date-fns/start_of_day');

var _start_of_day2 = _interopRequireDefault(_start_of_day);

var _is_same_minute = require('date-fns/is_same_minute');

var _is_same_minute2 = _interopRequireDefault(_is_same_minute);

var _format = require('date-fns/format');

var _format2 = _interopRequireDefault(_format);

var _colors = require('./colors');

var _colors2 = _interopRequireDefault(_colors);

var _selectionSchemes = require('./selection-schemes');

var _selectionSchemes2 = _interopRequireDefault(_selectionSchemes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Import only the methods we need from date-fns in order to keep build size small


var formatHour = function formatHour(hour) {
  var h = hour === 0 || hour === 12 || hour === 24 ? 12 : hour % 12;
  var abb = hour < 12 || hour === 24 ? 'am' : 'pm';
  return '' + h + abb;
};

var preventScroll = exports.preventScroll = function preventScroll(e) {
  e.preventDefault();
};

var ScheduleSelector = function (_React$Component) {
  _inherits(ScheduleSelector, _React$Component);

  function ScheduleSelector(props) {
    _classCallCheck(this, ScheduleSelector);

    // Generate list of dates to render cells for
    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.renderTimeLabels = function () {
      var labels = [_react2.default.createElement(_reactNative.Text, { style: { fontSize: 12, fontWeight: '400', color: _colors2.default.black, height: 30, textAlign: 'center' }, key: -1 })]; // Ensures time labels start at correct location
      for (var t = _this.props.minTime; t <= _this.props.maxTime; t += 1) {
        var _ref;

        labels.push(_react2.default.createElement(
          _reactNative.View,
          { style: (_ref = {
              position: 'relative',
              display: 'block',
              width: '100%',
              height: 25,
              marginTop: 3,
              marginBottom: 3,
              textAlign: 'center'
            }, _ref['display'] = 'flex', _ref.justifyContent = 'center', _ref.alignItems = 'center', _ref), key: t },
          _react2.default.createElement(
            _reactNative.Text,
            { style: {
                fontSize: 12,
                fontWeight: '300',
                lineHeight: 14 * 1.37,
                color: _colors2.default.grey,
                margin: 0,
                textAlign: 'right'
              } },
            formatHour(t)
          )
        ));
      }
      return _react2.default.createElement(
        _reactNative.View,
        { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', flexGrow: 1 }, margin: _this.props.margin },
        labels
      );
    };

    _this.renderDateColumn = function (dayOfTimes) {
      return _react2.default.createElement(
        _reactNative.View,
        { style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', flexGrow: 1 }, key: dayOfTimes[0], margin: _this.props.margin },
        _react2.default.createElement(
          _reactNative.View,
          { style: { margin: _this.props.margin, touchAction: 'none' } },
          _react2.default.createElement(
            _reactNative.Text,
            { style: { fontSize: 12, fontWeight: '400', color: _colors2.default.black, height: 30, textAlign: 'center' } },
            (0, _format2.default)(dayOfTimes[0], _this.props.dateFormat)
          )
        ),
        dayOfTimes.map(function (time) {
          return _this.renderDateCellWrapper(time);
        })
      );
    };

    _this.renderDateCellWrapper = function (time) {
      var _React$createElement;

      var startHandler = function startHandler() {
        _this.handleSelectionStartEvent(time);
      };

      var selected = Boolean(_this.state.selectionDraft.find(function (a) {
        return (0, _is_same_minute2.default)(a, time);
      }));

      return _react2.default.createElement(
        _reactNative.View,
        (_React$createElement = {
          style: { margin: _this.props.margin, touchAction: 'none' },
          className: 'rgdp__grid-cell',
          role: 'presentation',
          key: time.toISOString(),
          onResponderGrant: startHandler,
          onStartShouldSetResponder: function onStartShouldSetResponder(ev) {
            return true;
          },
          onMoveShouldSetResponder: function onMoveShouldSetResponder(ev) {
            return true;
          },
          onResponderTerminationRequest: function onResponderTerminationRequest(ev) {
            return true;
          }
        }, _React$createElement['onResponderGrant'] = _this.handleTouchMoveEvent.bind(_this, "onResponderGrant"), _React$createElement.onResponderReject = _this.handleTouchMoveEvent.bind(_this, "onResponderReject"), _React$createElement.onResponderMove = _this.handleTouchMoveEvent.bind(_this, "onResponderMove"), _React$createElement.onResponderRelease = _this.handleTouchMoveEvent.bind(_this, "onResponderRelease"), _React$createElement.onResponderTerminate = _this.handleTouchMoveEvent.bind(_this, "onResponderTerminate"), _React$createElement),
        _this.renderDateCell(time, selected)
      );
    };

    _this.renderDateCell = function (time, selected) {
      var refSetter = function refSetter(dateCell) {
        _this.cellToDate.set(dateCell, time);
      };
      if (_this.props.renderDateCell) {
        return _this.props.renderDateCell(time, selected, refSetter);
      } else {
        return _react2.default.createElement(_reactNative.View, {
          style: { width: '100%', height: 25, backgroundColor: selected ? _this.props.selectedColor : _this.props.unselectedColor },
          innerRef: refSetter
        });
      }
    };

    var startTime = (0, _start_of_day2.default)(props.startDate);
    _this.dates = [];
    _this.cellToDate = new Map();
    for (var d = 0; d < props.numDays; d += 1) {
      var currentDay = [];
      for (var h = props.minTime; h <= props.maxTime; h += 1) {
        currentDay.push((0, _add_hours2.default)((0, _add_days2.default)(startTime, d), h));
      }
      _this.dates.push(currentDay);
    }

    _this.state = {
      selectionDraft: [].concat(_this.props.selection), // copy it over
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    };

    _this.selectionSchemeHandlers = {
      linear: _selectionSchemes2.default.linear,
      square: _selectionSchemes2.default.square
    };

    _this.endSelection = _this.endSelection.bind(_this);
    _this.handleTouchEndEvent = _this.handleTouchEndEvent.bind(_this);
    _this.handleSelectionStartEvent = _this.handleSelectionStartEvent.bind(_this);
    return _this;
  }

  ScheduleSelector.prototype.componentDidMount = function componentDidMount() {
    // We need to add the endSelection event listener to the document itself in order
    // to catch the cases where the users ends their mouse-click somewhere besides
    // the date cells (in which case none of the DateCell's onMouseUp handlers would fire)
    //
    // This isn't necessary for touch events since the `touchend` event fires on
    // the element where the touch/drag started so it's always caught.
    // document.addEventListener('mouseup', this.endSelection)

    // Prevent page scrolling when user is dragging on the date cells
    this.cellToDate.forEach(function (value, dateCell) {
      if (dateCell && dateCell.addEventListener) {
        dateCell.addEventListener('touchmove', preventScroll, { passive: false });
      }
    });
  };

  ScheduleSelector.prototype.componentWillUnmount = function componentWillUnmount() {
    // document.removeEventListener('mouseup', this.endSelection)
    this.cellToDate.forEach(function (value, dateCell) {
      if (dateCell && dateCell.removeEventListener) {
        dateCell.removeEventListener('touchmove', preventScroll);
      }
    });
  };

  ScheduleSelector.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    this.setState({
      selectionDraft: [].concat(nextProps.selection)
    });
  };

  // Performs a lookup into this.cellToDate to retrieve the Date that corresponds to
  // the cell where this touch event is right now. Note that this method will only work
  // if the event is a `touchmove` event since it's the only one that has a `touches` list.


  ScheduleSelector.prototype.getTimeFromTouchEvent = function getTimeFromTouchEvent(event) {
    var touches = event.touches;

    if (!touches || touches.length === 0) return null;
    var _touches$ = touches[0],
        clientX = _touches$.clientX,
        clientY = _touches$.clientY;

    console.log({ clientX: clientX, clientY: clientY });
    // const targetElement = document.elementFromPoint(clientX, clientY)
    // const cellTime = this.cellToDate.get(targetElement)
    // return cellTime
  };

  ScheduleSelector.prototype.endSelection = function endSelection() {
    this.props.onChange(this.state.selectionDraft);
    this.setState({
      selectionType: null,
      selectionStart: null
    });
  };

  // Given an ending Date, determines all the dates that should be selected in this draft


  ScheduleSelector.prototype.updateAvailabilityDraft = function updateAvailabilityDraft(selectionEnd, callback) {
    var _state = this.state,
        selectionType = _state.selectionType,
        selectionStart = _state.selectionStart;


    if (selectionType === null || selectionStart === null) return;

    var newSelection = [];
    if (selectionStart && selectionEnd && selectionType) {
      newSelection = this.selectionSchemeHandlers[this.props.selectionScheme](selectionStart, selectionEnd, this.dates);
    }

    var nextDraft = [].concat(this.props.selection);
    if (selectionType === 'add') {
      nextDraft = Array.from(new Set([].concat(nextDraft, newSelection)));
    } else if (selectionType === 'remove') {
      nextDraft = nextDraft.filter(function (a) {
        return !newSelection.find(function (b) {
          return (0, _is_same_minute2.default)(a, b);
        });
      });
    }

    this.setState({ selectionDraft: nextDraft }, callback);
  };

  // Isomorphic (mouse and touch) handler since starting a selection works the same way for both classes of user input


  ScheduleSelector.prototype.handleSelectionStartEvent = function handleSelectionStartEvent(startTime) {
    // Check if the startTime cell is selected/unselected to determine if this drag-select should
    // add values or remove values
    var timeSelected = this.props.selection.find(function (a) {
      return (0, _is_same_minute2.default)(a, startTime);
    });
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: startTime
    });
  };

  ScheduleSelector.prototype.handleTouchMoveEvent = function handleTouchMoveEvent(name, event) {
    console.log('[' + name + '] ' + ('root_x: ' + event.nativeEvent.pageX + ', root_y: ' + event.nativeEvent.pageY + ' ') + ('target_x: ' + event.nativeEvent.locationX + ', target_y: ' + event.nativeEvent.locationY + ' ') + ('target: ' + event.nativeEvent.target));
    this.setState({ isTouchDragging: true });
    var cellTime = this.getTimeFromTouchEvent(event);
    if (cellTime) {
      this.updateAvailabilityDraft(cellTime);
    }
  };

  ScheduleSelector.prototype.handleTouchEndEvent = function handleTouchEndEvent() {
    var _this2 = this;

    if (!this.state.isTouchDragging) {
      // Going down this branch means the user tapped but didn't drag -- which
      // means the availability draft hasn't yet been updated (since
      // handleTouchMoveEvent was never called) so we need to do it now
      this.updateAvailabilityDraft(null, function () {
        _this2.endSelection();
      });
    } else {
      this.endSelection();
    }
    this.setState({ isTouchDragging: false });
  };

  ScheduleSelector.prototype.render = function render() {
    var _this3 = this;

    return _react2.default.createElement(
      _reactNative.View,
      { style: { display: 'flex', alignItems: 'center', width: '100%' } },
      _react2.default.createElement(
        _reactNative.View,
        {
          style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            width: '100%'
          },
          innerRef: function innerRef(el) {
            _this3.gridRef = el;
          }
        },
        this.renderTimeLabels(),
        this.dates.map(this.renderDateColumn)
      )
    );
  };

  return ScheduleSelector;
}(_react2.default.Component);

ScheduleSelector.defaultProps = {
  selection: [],
  selectionScheme: 'square',
  numDays: 7,
  minTime: 9,
  maxTime: 23,
  startDate: new Date(),
  dateFormat: 'M/D',
  margin: 3,
  selectedColor: _colors2.default.blue,
  unselectedColor: _colors2.default.paleBlue,
  hoveredColor: _colors2.default.lightBlue,
  onChange: function onChange() {}
};
exports.default = ScheduleSelector;