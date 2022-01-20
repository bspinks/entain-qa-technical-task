import React from 'react';
import './App.css';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      raceData: [],
      sortedRaces: [],
      unsortedRaces: [],
      selectedCategory: null,
      time: Date.now(),
      rowsToFetch: 5,
    };

    /** Categories for reference later on **/
    this.categories = {
      greyhounds: "9daef0d7-bf3c-4f50-921d-8e818c60fe61",
      thoroughbreds: "4a2788f8-e825-4d36-9894-efd4baf1cfae",
      harness: "161d9be2-e909-4326-8c2c-35ed71fb460b",
    };

    document.title = 'Entain Coding Test';
  }

  // Use fetch API to gather the 10 next races to jump and add it to app state
  // then set interval to update time in app state
  componentDidMount() {
    this.getRacingData();

    this.interval = setInterval(() => {
      this.setState({ time: Date.now() });
      this.getRacingData();
    }, 1000);
  }

  // Clear the interval once app is closed/unmounted
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // Fetch a specified number of next races to jump, sort by time ascending
  // race categories and races >=60 seconds over start time
  getRacingData = () => {
    fetch(`https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=${this.state.rowsToFetch}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }).then(res => res.json()).then(json => {
      const { data } = json;

      this.setState({
        sortedRaces: [],
      })

      let newRaces = [];

      const races = data.race_summaries;

      for (const [key] of Object.entries(races)) {
        const race = races[key];

        if (
          this.state.selectedCategory &&
          race.category_id !== this.state.selectedCategory
        ) {
          continue;
        }

        newRaces = newRaces.concat({
          raceNumber: race.race_number,
          meetingName: race.meeting_name,
          advertisedStart: race.advertised_start.seconds * 1000,
        });
      }

      // Sort races by time to jump and add them to race list
      newRaces.sort((item1, item2) => {
        return item1.advertisedStart - item2.advertisedStart;
      });

      // Filter races for only those which are <60 seconds over start time
      let sortedRaceCount = 0;

      this.setState({
        unsortedRaces: newRaces,
        sortedRaces: newRaces.filter((value) => {
          if (sortedRaceCount < 5 && (value.advertisedStart - this.state.time) > -60000) {
            sortedRaceCount++;
            return true;
          }
          return false;
        })
      });

      if (sortedRaceCount < 5) {
        this.setState({ rowsToFetch: this.state.rowsToFetch + 1 });
        this.getRacingData();
      }
    });
  }

  // Format time in XXmin XXs
  getFormattedTime = (rawTime) => {
    const timeMs = Math.round((rawTime - this.state.time) / 1000);
    const timeMins = Math.floor(Math.abs(timeMs) / 60);
    const timeSecs = Math.abs(timeMs) % 60;

    if (timeMs > 0) {
      return `Jumps in ${timeMins}min ${timeSecs}s`;
    } else {
      return `Jumped ${timeMins}min, ${timeSecs}s ago`;
    }
  }

  // Render components
  render() {
    return (
      <div className="container">
        <div className="buttonContainer">
          <button className="buttonToggle" onClick={() => {
            this.setState({ selectedCategory: null });
          }}>All Races</button>
        </div>
        <div className="categories">
          <div className="buttonContainer">
            <button className="buttonToggle" onClick={() => {
              this.setState({
                  selectedCategory: this.categories.greyhounds,
                });
            }}>Greyhounds</button>
          </div>
          <div className="buttonContainer">
            <button className="buttonToggle" onClick={() => {
              this.setState({ selectedCategory: this.categories.harness });
            }}>Harness</button>
          </div>
          <div className="buttonContainer">
            <button className="buttonToggle" onClick={() => {
              this.setState({ selectedCategory: this.categories.thoroughbreds });
            }}>Thoroughbreds</button>
          </div>
        </div>
        <div className="list">
          {this.state.sortedRaces.map(item => (
            <ul>
              <span className="item">
                Race {item.raceNumber} - {item.meetingName} -{" "}
                {this.getFormattedTime(item.advertisedStart)}
              </span>
            </ul>
          ))}
        </div>
      </div>
    );
  }
}
