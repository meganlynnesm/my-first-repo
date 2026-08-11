// Auto-generated from NYC Open Data GreenThumb Garden Info (p78i-pat6).
// One radar per day the dataset records (Wed/Fri/Sat). For each hour, value =
// share of that borough's gardens (with listed hours that day) that are open then.
const RADAR_AXES = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"];
const RADAR_BOROUGHS = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
const RADAR_DAYS = [
  {
    key: "w", label: "Wednesday", total: 226,
    counts: {"Bronx": 58, "Brooklyn": 100, "Manhattan": 52, "Queens": 12, "Staten Island": 4},
    data: [
      [{axis:"8 AM",value:0.034}, {axis:"9 AM",value:0.259}, {axis:"10 AM",value:0.483}, {axis:"11 AM",value:0.534}, {axis:"12 PM",value:0.603}, {axis:"1 PM",value:0.603}, {axis:"2 PM",value:0.534}, {axis:"3 PM",value:0.517}, {axis:"4 PM",value:0.397}, {axis:"5 PM",value:0.259}, {axis:"6 PM",value:0.103}, {axis:"7 PM",value:0.052}], // Bronx
      [{axis:"8 AM",value:0.17}, {axis:"9 AM",value:0.35}, {axis:"10 AM",value:0.52}, {axis:"11 AM",value:0.53}, {axis:"12 PM",value:0.48}, {axis:"1 PM",value:0.4}, {axis:"2 PM",value:0.32}, {axis:"3 PM",value:0.25}, {axis:"4 PM",value:0.24}, {axis:"5 PM",value:0.25}, {axis:"6 PM",value:0.21}, {axis:"7 PM",value:0.12}], // Brooklyn
      [{axis:"8 AM",value:0.096}, {axis:"9 AM",value:0.231}, {axis:"10 AM",value:0.365}, {axis:"11 AM",value:0.481}, {axis:"12 PM",value:0.596}, {axis:"1 PM",value:0.596}, {axis:"2 PM",value:0.442}, {axis:"3 PM",value:0.481}, {axis:"4 PM",value:0.404}, {axis:"5 PM",value:0.269}, {axis:"6 PM",value:0.192}, {axis:"7 PM",value:0.077}], // Manhattan
      [{axis:"8 AM",value:0.0}, {axis:"9 AM",value:0.25}, {axis:"10 AM",value:0.667}, {axis:"11 AM",value:0.667}, {axis:"12 PM",value:0.5}, {axis:"1 PM",value:0.417}, {axis:"2 PM",value:0.5}, {axis:"3 PM",value:0.417}, {axis:"4 PM",value:0.333}, {axis:"5 PM",value:0.167}, {axis:"6 PM",value:0.0}, {axis:"7 PM",value:0.0}], // Queens
      [{axis:"8 AM",value:0.0}, {axis:"9 AM",value:0.0}, {axis:"10 AM",value:0.25}, {axis:"11 AM",value:0.25}, {axis:"12 PM",value:0.0}, {axis:"1 PM",value:0.0}, {axis:"2 PM",value:0.25}, {axis:"3 PM",value:0.25}, {axis:"4 PM",value:0.25}, {axis:"5 PM",value:0.5}, {axis:"6 PM",value:0.5}, {axis:"7 PM",value:0.25}], // Staten Island
    ],
  },
  {
    key: "f", label: "Friday", total: 211,
    counts: {"Bronx": 58, "Brooklyn": 90, "Manhattan": 51, "Queens": 8, "Staten Island": 4},
    data: [
      [{axis:"8 AM",value:0.017}, {axis:"9 AM",value:0.207}, {axis:"10 AM",value:0.397}, {axis:"11 AM",value:0.483}, {axis:"12 PM",value:0.621}, {axis:"1 PM",value:0.69}, {axis:"2 PM",value:0.621}, {axis:"3 PM",value:0.569}, {axis:"4 PM",value:0.466}, {axis:"5 PM",value:0.345}, {axis:"6 PM",value:0.138}, {axis:"7 PM",value:0.069}], // Bronx
      [{axis:"8 AM",value:0.189}, {axis:"9 AM",value:0.333}, {axis:"10 AM",value:0.5}, {axis:"11 AM",value:0.533}, {axis:"12 PM",value:0.478}, {axis:"1 PM",value:0.489}, {axis:"2 PM",value:0.444}, {axis:"3 PM",value:0.322}, {axis:"4 PM",value:0.3}, {axis:"5 PM",value:0.267}, {axis:"6 PM",value:0.178}, {axis:"7 PM",value:0.089}], // Brooklyn
      [{axis:"8 AM",value:0.098}, {axis:"9 AM",value:0.255}, {axis:"10 AM",value:0.333}, {axis:"11 AM",value:0.471}, {axis:"12 PM",value:0.569}, {axis:"1 PM",value:0.588}, {axis:"2 PM",value:0.451}, {axis:"3 PM",value:0.49}, {axis:"4 PM",value:0.471}, {axis:"5 PM",value:0.333}, {axis:"6 PM",value:0.235}, {axis:"7 PM",value:0.078}], // Manhattan
      [{axis:"8 AM",value:0.125}, {axis:"9 AM",value:0.5}, {axis:"10 AM",value:0.75}, {axis:"11 AM",value:0.75}, {axis:"12 PM",value:0.5}, {axis:"1 PM",value:0.375}, {axis:"2 PM",value:0.375}, {axis:"3 PM",value:0.375}, {axis:"4 PM",value:0.375}, {axis:"5 PM",value:0.0}, {axis:"6 PM",value:0.0}, {axis:"7 PM",value:0.0}], // Queens
      [{axis:"8 AM",value:0.0}, {axis:"9 AM",value:0.0}, {axis:"10 AM",value:0.25}, {axis:"11 AM",value:0.25}, {axis:"12 PM",value:0.0}, {axis:"1 PM",value:0.0}, {axis:"2 PM",value:0.25}, {axis:"3 PM",value:0.25}, {axis:"4 PM",value:0.25}, {axis:"5 PM",value:0.5}, {axis:"6 PM",value:0.5}, {axis:"7 PM",value:0.25}], // Staten Island
    ],
  },
  {
    key: "sa", label: "Saturday", total: 308,
    counts: {"Bronx": 64, "Brooklyn": 141, "Manhattan": 85, "Queens": 16, "Staten Island": 2},
    data: [
      [{axis:"8 AM",value:0.031}, {axis:"9 AM",value:0.172}, {axis:"10 AM",value:0.531}, {axis:"11 AM",value:0.641}, {axis:"12 PM",value:0.688}, {axis:"1 PM",value:0.797}, {axis:"2 PM",value:0.781}, {axis:"3 PM",value:0.594}, {axis:"4 PM",value:0.438}, {axis:"5 PM",value:0.266}, {axis:"6 PM",value:0.094}, {axis:"7 PM",value:0.047}], // Bronx
      [{axis:"8 AM",value:0.135}, {axis:"9 AM",value:0.305}, {axis:"10 AM",value:0.674}, {axis:"11 AM",value:0.787}, {axis:"12 PM",value:0.73}, {axis:"1 PM",value:0.688}, {axis:"2 PM",value:0.574}, {axis:"3 PM",value:0.411}, {axis:"4 PM",value:0.27}, {axis:"5 PM",value:0.206}, {axis:"6 PM",value:0.085}, {axis:"7 PM",value:0.043}], // Brooklyn
      [{axis:"8 AM",value:0.047}, {axis:"9 AM",value:0.188}, {axis:"10 AM",value:0.376}, {axis:"11 AM",value:0.588}, {axis:"12 PM",value:0.753}, {axis:"1 PM",value:0.812}, {axis:"2 PM",value:0.776}, {axis:"3 PM",value:0.718}, {axis:"4 PM",value:0.506}, {axis:"5 PM",value:0.341}, {axis:"6 PM",value:0.176}, {axis:"7 PM",value:0.035}], // Manhattan
      [{axis:"8 AM",value:0.0}, {axis:"9 AM",value:0.375}, {axis:"10 AM",value:0.625}, {axis:"11 AM",value:0.812}, {axis:"12 PM",value:0.75}, {axis:"1 PM",value:0.688}, {axis:"2 PM",value:0.625}, {axis:"3 PM",value:0.312}, {axis:"4 PM",value:0.25}, {axis:"5 PM",value:0.125}, {axis:"6 PM",value:0.062}, {axis:"7 PM",value:0.0}], // Queens
      [{axis:"8 AM",value:0.5}, {axis:"9 AM",value:0.5}, {axis:"10 AM",value:1.0}, {axis:"11 AM",value:1.0}, {axis:"12 PM",value:1.0}, {axis:"1 PM",value:0.5}, {axis:"2 PM",value:0.5}, {axis:"3 PM",value:0.0}, {axis:"4 PM",value:0.0}, {axis:"5 PM",value:0.0}, {axis:"6 PM",value:0.0}, {axis:"7 PM",value:0.0}], // Staten Island
    ],
  },
];
