const statesData = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const getEl = (id) => document.getElementById(id);
const socket = io({ transports: ["websocket"], upgrade: false });

const formatPct = (pct) => Math.round(10000 * pct) / 100;
const formatNum = (num) =>
  num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");

const initHover = (states, electoralCollege) => {
  Object.keys(states).forEach((id) => {
    const jb = +states[id].JB;
    const djt = +states[id].DJT;

    const jbProgress = formatPct(jb / (djt + jb));
    const djtProgress = formatPct(djt / (djt + jb));

    const state = getEl(id);
    state.setAttribute(
      "title",
      `
        <span class="text-muted">${statesData[id]}</span>
        ${electoralCollege[id]} EV
    `
    );
    state.setAttribute("data-toggle", "popover");
    state.setAttribute("data-placement", "top");
    state.setAttribute("data-trigger", "hover");
    state.setAttribute("data-html", "true");
    state.setAttribute(
      "data-content",
      `
        <div class="row pb-1">
            <div class="col">
                <b class="blue">Joe Biden</b>
            </div>
            <div class="col text-right text-nowrap">
                <b class="red">Donald J. Trump</b>
            </div>
        </div>

        <div class="progress" style="height: 25px;">
            <div class="progress-bar jb-progress" role="progressbar" style="width: ${jbProgress}%;" aria-valuenow="${jbProgress}" aria-valuemin="0"
                aria-valuemax="100"></div>
            <div class="progress-bar djt-progress" role="progressbar" style="width: ${djtProgress}%;" aria-valuenow="${djtProgress}" aria-valuemin="0"
                aria-valuemax="100"></div>
        </div>

        <div class="clearfix py-1">
            <span class="float-left text-muted">
                <small>${formatNum(jb)} votes</small><br />
                (${jbProgress}%)
            </span>
            
            <span class="text-muted float-right text-right">
                <small>${formatNum(djt)} votes</small><br />
                (${djtProgress}%)
            </span>
        </div>  
      `
    );
  });
};

const init = () => {
  const defaultWhiteList = $.fn.tooltip.Constructor.Default.whiteList;
  defaultWhiteList["*"].push("style");

  socket.on("results", (data) => {
    const {
      candidates,
      states,
      updatedAt,
      electoralCollege,
      electoralVotes,
    } = data;
    const jb = +candidates.JB;
    const djt = +candidates.DJT;

    const jbProgress = formatPct(jb / (djt + jb));
    const djtProgress = formatPct(djt / (djt + jb));

    getEl("jb-electoralvotes").innerHTML = electoralVotes.JB;
    getEl("djt-electoralvotes").innerHTML = electoralVotes.DJT;

    getEl("jb-progress").style.width = `${jbProgress}%`;
    getEl("jb-progress").setAttribute("aria-valuenow", jbProgress);
    getEl("jb-votes").innerHTML = `${formatNum(jb)} votes`;
    getEl("jb-pct").innerHTML = `(${jbProgress}%)`;

    getEl("djt-progress").style.width = `${djtProgress}%`;
    getEl("djt-progress").setAttribute("aria-valuenow", djtProgress);
    getEl("djt-votes").innerHTML = `${formatNum(djt)} votes`;
    getEl("djt-pct").innerHTML = `(${djtProgress}%)`;

    getEl("updatedAt").innerHTML = dateFns.format(updatedAt, "MMM Do, YYYY, h:mm:ss a");

    Object.keys(states).forEach((state) => {
      try {
        const { DJT: djt, JB: jb } = states[state];
        const stateEl = document.getElementById(state);
        stateEl.classList.remove("red", "blue");

        stateEl.classList.add(djt > jb ? "red" : jb > djt ? "blue" : "");
      } catch (err) {}
    });

    initHover(states, electoralCollege);
    $('[data-toggle="popover"]').popover();
  });
};

socket.on("message", function (data) {
  init();
});

socket.on("disconnect", () => {
  socket.removeAllListeners();
});
