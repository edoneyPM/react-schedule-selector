import React from 'react'
import { View, Text } from 'react-native'

// Import only the methods we need from date-fns in order to keep build size small
import addHours from 'date-fns/add_hours'
import addDays from 'date-fns/add_days'
import startOfDay from 'date-fns/start_of_day'
import isSameMinute from 'date-fns/is_same_minute'
import formatDate from 'date-fns/format'

import colors from './colors'
import selectionSchemes from './selection-schemes'

const formatHour = (hour) => {
  const h = hour === 0 || hour === 12 || hour === 24 ? 12 : hour % 12
  const abb = hour < 12 || hour === 24 ? 'am' : 'pm'
  return `${h}${abb}`
}

type PropsType = {
  selection: Array<Date>,
  selectionScheme: SelectionSchemeType,
  onChange: (Array<Date>) => void,
  startDate: Date,
  numDays: number,
  minTime: number,
  maxTime: number,
  dateFormat: string,
  margin: number,
  unselectedColor: string,
  selectedColor: string,
  hoveredColor: string,
  renderDateCell?: (Date, boolean, (HTMLElement) => void) => React.Node
}

type StateType = {
  // In the case that a user is drag-selecting, we don't want to call this.props.onChange() until they have completed
  // the drag-select. selectionDraft serves as a temporary copy during drag-selects.
  selectionDraft: Array<Date>,
  selectionType: ?SelectionType,
  selectionStart: ?Date,
  isTouchDragging: boolean
}

export const preventScroll = (e: TouchEvent) => {
  e.preventDefault()
}

export default class ScheduleSelector extends React.Component<PropsType, StateType> {
  dates: Array<Array<Date>>
  selectionSchemeHandlers: { [string]: (Date, Date, Array<Array<Date>>) => Date[] }
  cellToDate: Map<HTMLElement, Date>
  documentMouseUpHandler: () => void
  endSelection: () => void
  handleTouchMoveEvent: (SyntheticTouchEvent<*>) => void
  handleTouchEndEvent: () => void
  handleMouseUpEvent: Date => void
  handleMouseEnterEvent: Date => void
  handleSelectionStartEvent: Date => void
  gridRef: ?HTMLElement

  static defaultProps = {
    selection: [],
    selectionScheme: 'square',
    numDays: 7,
    minTime: 9,
    maxTime: 23,
    startDate: new Date(),
    dateFormat: 'M/D',
    margin: 3,
    selectedColor: colors.blue,
    unselectedColor: colors.paleBlue,
    hoveredColor: colors.lightBlue,
    onChange: () => {}
  }

  constructor(props: PropsType) {
    super(props)

    // Generate list of dates to render cells for
    const startTime = startOfDay(props.startDate)
    this.dates = []
    this.cellToDate = new Map()
    for (let d = 0; d < props.numDays; d += 1) {
      const currentDay = []
      for (let h = props.minTime; h <= props.maxTime; h += 1) {
        currentDay.push(addHours(addDays(startTime, d), h))
      }
      this.dates.push(currentDay)
    }

    this.state = {
      selectionDraft: [...this.props.selection], // copy it over
      selectionType: null,
      selectionStart: null,
      isTouchDragging: false
    }

    this.selectionSchemeHandlers = {
      linear: selectionSchemes.linear,
      square: selectionSchemes.square
    }

    this.endSelection = this.endSelection.bind(this)
    this.handleTouchEndEvent = this.handleTouchEndEvent.bind(this)
    this.handleSelectionStartEvent = this.handleSelectionStartEvent.bind(this)
  }

  componentDidMount() {
    // We need to add the endSelection event listener to the document itself in order
    // to catch the cases where the users ends their mouse-click somewhere besides
    // the date cells (in which case none of the DateCell's onMouseUp handlers would fire)
    //
    // This isn't necessary for touch events since the `touchend` event fires on
    // the element where the touch/drag started so it's always caught.
    // document.addEventListener('mouseup', this.endSelection)

    // Prevent page scrolling when user is dragging on the date cells
    this.cellToDate.forEach((value, dateCell) => {
      if (dateCell && dateCell.addEventListener) {
        dateCell.addEventListener('touchmove', preventScroll, { passive: false })
      }
    })
  }

  componentWillUnmount() {
    // document.removeEventListener('mouseup', this.endSelection)
    this.cellToDate.forEach((value, dateCell) => {
      if (dateCell && dateCell.removeEventListener) {
        dateCell.removeEventListener('touchmove', preventScroll)
      }
    })
  }

  componentWillReceiveProps(nextProps: PropsType) {
    this.setState({
      selectionDraft: [...nextProps.selection]
    })
  }

  // Performs a lookup into this.cellToDate to retrieve the Date that corresponds to
  // the cell where this touch event is right now. Note that this method will only work
  // if the event is a `touchmove` event since it's the only one that has a `touches` list.
  getTimeFromTouchEvent(event: SyntheticTouchEvent<*>): ?Date {
    const { touches } = event
    if (!touches || touches.length === 0) return null
    const { clientX, clientY } = touches[0]
    console.log({ clientX, clientY })
    // const targetElement = document.elementFromPoint(clientX, clientY)
    // const cellTime = this.cellToDate.get(targetElement)
    // return cellTime
  }

  endSelection() {
    this.props.onChange(this.state.selectionDraft)
    this.setState({
      selectionType: null,
      selectionStart: null
    })
  }

  // Given an ending Date, determines all the dates that should be selected in this draft
  updateAvailabilityDraft(selectionEnd: ?Date, callback?: () => void) {
    const { selectionType, selectionStart } = this.state

    if (selectionType === null || selectionStart === null) return

    let newSelection = []
    if (selectionStart && selectionEnd && selectionType) {
      newSelection = this.selectionSchemeHandlers[this.props.selectionScheme](selectionStart, selectionEnd, this.dates)
    }

    let nextDraft = [...this.props.selection]
    if (selectionType === 'add') {
      nextDraft = Array.from(new Set([...nextDraft, ...newSelection]))
    } else if (selectionType === 'remove') {
      nextDraft = nextDraft.filter(a => !newSelection.find(b => isSameMinute(a, b)))
    }

    this.setState({ selectionDraft: nextDraft }, callback)
  }

  // Isomorphic (mouse and touch) handler since starting a selection works the same way for both classes of user input
  handleSelectionStartEvent(startTime: Date) {
    // Check if the startTime cell is selected/unselected to determine if this drag-select should
    // add values or remove values
    const timeSelected = this.props.selection.find(a => isSameMinute(a, startTime))
    this.setState({
      selectionType: timeSelected ? 'remove' : 'add',
      selectionStart: startTime
    })
  }

  handleTouchMoveEvent(name, event) {
    console.log(
      `[${name}] ` + 
      `root_x: ${event.nativeEvent.pageX}, root_y: ${event.nativeEvent.pageY} ` +
      `target_x: ${event.nativeEvent.locationX}, target_y: ${event.nativeEvent.locationY} ` + 
      `target: ${event.nativeEvent.target}`
    )
    this.setState({ isTouchDragging: true })
    const cellTime = this.getTimeFromTouchEvent(event)
    if (cellTime) {
      this.updateAvailabilityDraft(cellTime)
    }
  }

  handleTouchEndEvent() {
    if (!this.state.isTouchDragging) {
      // Going down this branch means the user tapped but didn't drag -- which
      // means the availability draft hasn't yet been updated (since
      // handleTouchMoveEvent was never called) so we need to do it now
      this.updateAvailabilityDraft(null, () => {
        this.endSelection()
      })
    } else {
      this.endSelection()
    }
    this.setState({ isTouchDragging: false })
  }

  renderTimeLabels = (): React.Element<*> => {
    const labels = [<Text style={{ fontSize: 12, fontWeight: '400', color: colors.black, height: 30, textAlign: 'center' }} key={-1} />] // Ensures time labels start at correct location
    for (let t = this.props.minTime; t <= this.props.maxTime; t += 1) {
      labels.push(
        <View style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: 25,
          marginTop: 3,
          marginBottom: 3,
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }} key={t}>
          <Text style={{
            fontSize: 12,
            fontWeight: '300',
            lineHeight: 14 * 1.37,
            color: colors.grey,
            margin: 0,
            textAlign: 'right'
          }}>{formatHour(t)}</Text>
        </View>
      )
    }
    return <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', flexGrow: 1 }} margin={this.props.margin}>{labels}</View>
  }

  renderDateColumn = (dayOfTimes: Array<Date>) => (
    <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', flexGrow: 1 }} key={dayOfTimes[0]} margin={this.props.margin}>
      <View style={{ margin: this.props.margin, touchAction: 'none' }}>
        <Text style={{ fontSize: 12, fontWeight: '400', color: colors.black, height: 30, textAlign: 'center' }}>{formatDate(dayOfTimes[0], this.props.dateFormat)}</Text>
      </View>
      {dayOfTimes.map(time => this.renderDateCellWrapper(time))}
    </View>
  )

  renderDateCellWrapper = (time: Date): React.Element<*> => {
    const startHandler = () => {
      this.handleSelectionStartEvent(time)
    }

    const selected = Boolean(this.state.selectionDraft.find(a => isSameMinute(a, time)))

    return (
      <View
        style={{ margin: this.props.margin, touchAction: 'none' }}
        className="rgdp__grid-cell"
        role="presentation"
        key={time.toISOString()}
        onResponderGrant={startHandler}
        onStartShouldSetResponder={(ev) => true}
        onMoveShouldSetResponder={(ev) => true}
        onResponderTerminationRequest={(ev) => true}
        onResponderGrant={this.handleTouchMoveEvent.bind(this, "onResponderGrant")}
        onResponderReject={this.handleTouchMoveEvent.bind(this, "onResponderReject")}
        onResponderMove={this.handleTouchMoveEvent.bind(this, "onResponderMove")}
        onResponderRelease={this.handleTouchMoveEvent.bind(this, "onResponderRelease")}
        onResponderTerminate={this.handleTouchMoveEvent.bind(this, "onResponderTerminate")}
        // onTouchStart={startHandler}
        // onTouchMove={this.handleTouchMoveEvent}
        // onTouchEnd={this.handleTouchEndEvent}
      >
        {this.renderDateCell(time, selected)}
      </View>
    )
  }

  renderDateCell = (time: Date, selected: boolean): React.Node => {
    const refSetter = (dateCell: HTMLElement) => {
      this.cellToDate.set(dateCell, time)
    }
    if (this.props.renderDateCell) {
      return this.props.renderDateCell(time, selected, refSetter)
    } else {
      return (
        <View
          style={{ width: '100%', height: 25, backgroundColor: selected ? this.props.selectedColor : this.props.unselectedColor}}
          innerRef={refSetter}
        />
      )
    }
  }

  render(): React.Element<*> {
    return (
      <View style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              width: '100%'
            }}
            innerRef={el => {
              this.gridRef = el
            }}
          >
            {this.renderTimeLabels()}
            {this.dates.map(this.renderDateColumn)}
          </View>
        }
      </View>
    )
  }
}
