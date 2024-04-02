<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { computePosition, autoPlacement, offset } from "@floating-ui/dom";

  let data = [];
  let commits = [];
  let totalLOC = 0;
  let numCommits = 0;
  let numFiles = 0;
  let maxPeriod = "";
  let authors = 0;
  let totalLinesEdited = 0;
  let svg;

  let width = 1000,
    height = 600;
  let margin = { top: 10, right: 10, bottom: 30, left: 20 };
  let usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;

  let xScale, yScale, xAxis, yAxis, yAxisGridlines;

  let hoveredIndex = -1;
  let brushSelection = null;
  let selectedCommits = [];
  let hasSelection = false;
  let hoveredCommit = {};
  let commitTooltip;
  let tooltipPosition = { x: 0, y: 0 };

  function brushed(evt) {
    brushSelection = evt.selection;
  }

  let cursor = { x: 0, y: 0 };

  async function dotInteraction(index, evt) {
    if (evt.type === "mouseenter" || evt.type === "focus") {
      hoveredIndex = index;
      let hoveredDot = evt.target;
      tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
        strategy: "fixed",
        middleware: [offset(5), autoPlacement()],
      });
    } else if (evt.type === "mouseleave" || evt.type === "blur") {
      hoveredIndex = -1;
    }
  }

  onMount(() => {
    d3.select(svg).call(d3.brush().on("start brush end", brushed));
    d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  });

  // $: hoveredCommit = commits[hoveredIndex] ?? {};

  onMount(async () => {
    data = await d3.csv("loc.csv", (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime),
    }));

    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: "https://github.com/vis-society/lab-7/commit/" + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };

        Object.defineProperty(ret, "lines", {
          value: lines,
          configurable: true,
          writable: true,
          enumerable: false,
        });

        return ret;
      });

    totalLOC = data.length;

    numCommits = commits.length;

    numFiles = d3.group(data, (d) => d.file).size;

    let workByPeriod = d3.rollups(
      data,
      (v) => v.length,
      (d) => d.datetime.toLocaleString("en", { dayPeriod: "short" })
    );
    maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    authors = d3.group(data, (d) => d.author).size;

    totalLinesEdited = d3.sum(data, (d) => d.length);

    xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();

    yScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);

    xAxis = d3.axisBottom(xScale);
    yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

    yAxisGridlines = d3
      .axisLeft(yScale)
      .tickFormat("")
      .tickSize(-usableArea.width);
  });

  $: {
    d3.select(xAxis).call(d3.axisBottom(xScale));

    d3.select(yAxis).call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00")
    );

    d3.select(yAxisGridlines).call(
      d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
    );

    d3.select(svg).call(d3.brush().on("start brush end", brushed));
    d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
    tooltipPosition = cursor;
    selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    hasSelection = brushSelection && selectedCommits.length > 0;
  }

  function isCommitSelected(commit) {
    if (!brushSelection) {
      return false;
    }
    const [[x0, y0], [x1, y1]] = brushSelection;
    const [xScale, yScale] = [xScale(commit.datetime), yScale(commit.hourFrac)];
    return xScale >= x0 && xScale <= x1 && yScale >= y0 && yScale <= y1;
  }
</script>

<h1>Meta</h1>
<svelte:head>
  <title>Meta</title>
</svelte:head>

<h2>Commits by time of day</h2>
<svg viewBox="0 0 {width} {height}" bind:this={svg}>
  <g
    class="x-axis"
    transform="translate(0, {usableArea.bottom})"
    bind:this={xAxis}
  />
  <g
    class="y-axis"
    transform="translate({usableArea.left}, 0)"
    bind:this={yAxis}
  />
  <g
    class="gridlines"
    transform="translate({usableArea.left}, 0)"
    bind:this={yAxisGridlines}
  />

  <g class="dots">
    {#each commits as commit, index}
      <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r="5"
        fill="steelblue"
        tabindex="0"
        aria-describedby="commit-tooltip"
        role="tooltip"
        aria-haspopup="true"
        on:mouseenter={(evt) => dotInteraction(index, evt)}
        on:mouseleave={(evt) => dotInteraction(index, evt)}
        on:focus={(evt) => dotInteraction(index, evt)}
        on:blur={(evt) => dotInteraction(index, evt)}
      />
    {/each}
  </g>
</svg>

<h2>Summary Stats</h2>
<section>
  <dl
    id="commit-tooltip"
    class="info tooltip"
    hidden={hoveredIndex === -1}
    style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px"
  >
    <div>
      <dt><b>Commit</b></dt>
      <dd>
        <a href={hoveredCommit.url} target="_blank">{hoveredCommit.id}</a>
      </dd>
    </div>
    <div>
      <dt><b>Date</b></dt>
      <dd>{hoveredCommit.datetime?.toLocaleString("en", { date: "full" })}</dd>
    </div>
  </dl>

  <dl class="stats">
    <div>
      <dt>
        <b>Total</b> <abbr title="Lines of code"><b>lines of code</b></abbr>
      </dt>
      <dd>{totalLOC}</dd>
    </div>

    <div>
      <dt><b>Total Commits</b></dt>
      <dd>{numCommits}</dd>
    </div>
    <div>
      <dt><b>Files</b></dt>
      <dd>{numFiles}</dd>
    </div>
    <div>
      <dt><b>Time of Day most work is done</b></dt>
      <dd>{maxPeriod}</dd>
    </div>
    <div>
      <dt><b>Total Authors</b></dt>
      <dd>
        {authors}
      </dd>
    </div>
    <div>
      <dt><b>Lines edited</b></dt>
      <dd>
        {totalLinesEdited}
      </dd>
    </div>
  </dl>
</section>

<style>
  section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  dl {
    display: contents;
  }

  dt,
  dd {
    grid-row: 1 / span 2;
    padding: 5px;
  }
  svg {
    overflow: visible;
  }
  .gridlines {
    stroke-opacity: 0.2;
  }
  dl.info {
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    padding: 10px;
    position: fixed;
    top: 0;
    left: 0;
    transition-duration: 500ms;
    transition-property: opacity, visibility;
  }

  dl.info[hidden]:not(:hover, :focus-within) {
    opacity: 0;
    visibility: hidden;
  }
  .tooltip {
    position: fixed;
  }
  circle {
    transition: 200ms;

    &:hover {
      transform: scale(1.5);
    }
    transform-origin: center;
    transform-box: fill-box;
  }
</style>
